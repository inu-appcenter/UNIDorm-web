import styled from "styled-components";
import NotiItem from "../components/notification/NotiItem.tsx";
import { useEffect, useRef, useState } from "react";
import { useNotificationScroll } from "@/queries/notifications";
import useUserStore from "../stores/useUserStore.ts";
import { flushAllBroadcastSync } from "@/stores/middleware/broadcastSync";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { roommateKeys } from "@/queries/roommates";
import {
  acceptRoommateMatching,
  rejectRoommateMatching,
} from "@/apis/roommate";
import { isAxiosError } from "axios";
import { useSetHeader } from "@/hooks/useSetHeader";
import Modal from "@/components/modal/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { PATHS } from "@/constants/paths";

const PAGE_SIZE = 20;

const NotificationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tokenInfo, userInfo, clearUnreadNotifications } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedMatching, setSelectedMatching] = useState<{
    id: number;
    message: string;
  } | null>(null);

  // ?åÎ¶º ?∞Ïù¥??Î¨¥Ìïú?§ÌÅ¨Î°?Ï°∞Ìöå
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isLoading } =
    useNotificationScroll(PAGE_SIZE, { enabled: isLoggedIn });

  // ?åÎ¶º ?òÏù¥ÏßÄ ÏßÑÏûÖ Î∞??¥ÌÉà ??ÎØ∏ÏùΩ???åÎ¶º ?ÅÌÉú ?¥Ï†ú Î∞?Î∏åÎ°ú?úÏ∫ê?§Ìä∏ ?ôÍ∏∞??
  useEffect(() => {
    clearUnreadNotifications();
    flushAllBroadcastSync();

    return () => {
      clearUnreadNotifications();
      flushAllBroadcastSync();
    };
  }, [clearUnreadNotifications]);

  // ?åÎ¶º Î™©Î°ù ?òÏã† ?úÏóê??ÎØ∏ÏùΩ???ÅÌÉúÍ∞Ä ?®ÏïÑ?àÎã§Î©??¥Ï†ú
  useEffect(() => {
    if (userInfo.hasUnreadNotifications) {
      clearUnreadNotifications();
      flushAllBroadcastSync();
    }
  }, [userInfo.hasUnreadNotifications, clearUnreadNotifications]);

  // ?∞Ïù¥???âÌÉÑ??Ï≤òÎ¶¨
  const notifications = data?.pages.flatMap((page) => page.data) || [];

  // Í¥ÄÏ∞∞Ïûê ?§Ï†ï (?òÎã® ?ÑÎã¨ ???§Ïùå ?òÏù¥ÏßÄ ?∏Ï∂ú)
  useEffect(() => {
    if (!observerTarget.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Îß§Ïπ≠ ?îÏ≤≠ ?¥Î¶≠ ?∏Îì§??
  const handleRoommateRequestClick = (matchingId: number, message: string) => {
    setSelectedMatching({ id: matchingId, message });
    setIsMatchModalOpen(true);
  };

  // ?òÎùΩ ?∏Îì§??
  const handleAccept = async () => {
    if (!window.confirm("?ïÎßê Îß§Ïπ≠???òÎùΩ?†Íπå??")) {
      return;
    }

    if (!selectedMatching) return;
    try {
      await acceptRoommateMatching(selectedMatching.id);
      queryClient.invalidateQueries({ queryKey: roommateKeys.myInfo() });
      alert("Îß§Ïπ≠ ?îÏ≤≠???òÎùΩ?òÏóà?µÎãà??");
      alert(
        "UNI Dorm?êÏÑú??Î£∏Î©î?¥Ìä∏ Îß§Ïπ≠?Ä ?§Ï†ú Í∏∞Ïàô??Î£∏Î©î?¥Ìä∏ ÏßÄ?ïÍ≥º Î¨¥Í??òÎ©∞, Î£∏Î©î?¥Ìä∏?Ä???∏Î¶¨???ùÌôú???ÑÌïú ?úÎπÑ?§Î? ?úÍ≥µ?òÍ∏∞ ?ÑÌï®?ÖÎãà??\nÎ∞òÎìú??Î£∏Î©î?¥Ìä∏ ?¨Ï†Ñ ÏßÄ??Í∏∞Í∞Ñ???∏Ï≤ú?Ä?ôÍµê ?¨ÌÑ∏?êÏÑú ?†Ï≤≠?¥Ï£º?∏Ïöî!!!!",
      );
      refetch();
    } catch (e: any) {
      handleError(e);
    } finally {
      setIsMatchModalOpen(false);
    }
  };

  // Í±∞Ï†à ?∏Îì§??
  const handleReject = async () => {
    if (!window.confirm("?ïÎßê Îß§Ïπ≠??Í±∞Ï†à?†Íπå??")) {
      return;
    }
    if (!selectedMatching) return;
    try {
      await rejectRoommateMatching(selectedMatching.id);
      alert("Îß§Ïπ≠ ?îÏ≤≠??Í±∞Ï†à?òÏóà?µÎãà??");
      refetch();
    } catch (e: any) {
      handleError(e);
    } finally {
      setIsMatchModalOpen(false);
    }
  };

  // ?êÎü¨ Ï≤òÎ¶¨ ?∏Îì§??
  const handleError = (e: any) => {
    if (isAxiosError(e) && e.response?.status === 409) {
      alert("?¥Î? Ï≤òÎ¶¨??Îß§Ïπ≠ ?îÏ≤≠?ÖÎãà??");
      refetch();
      return;
    }
    alert("Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.");
  };

  // ?§Îçî ?§Ï†ï
  useSetHeader({
    title: "?åÎ¶º",
    menuItems: [
      {
        label: "?åÎ¶º ?òÏã† ?§Ï†ï",
        onClick: () => navigate("/notification-setting"),
      },
    ],
  });

  if (isLoading && !isFetchingNextPage) {
    return <LoadingSpinner message="?åÎ¶º??Î∂àÎü¨?§Îäî Ï§ëÏûÖ?àÎã§..." />;
  }

  return (
    <NotificationPageWrapper>
      <ContentWrapper>
        {notifications.length > 0 ? (
          <>
            {notifications.map((noti) => (
              <NotiItem
                key={noti.id}
                notidata={noti}
                onMatchRequestClick={handleRoommateRequestClick}
              />
            ))}
            {/* Î¨¥Ìïú?§ÌÅ¨Î°??∏Î¶¨Í±?ÏßÄ??*/}
            <div ref={observerTarget} style={{ height: "10px" }} />
            {isFetchingNextPage && <LoadingSpinner message="" />}
          </>
        ) : isLoggedIn ? (
          <EmptyMessage>?åÎ¶º???ÜÏäµ?àÎã§.</EmptyMessage>
        ) : (
          <EmptyMessage>
            Î°úÍ∑∏?????åÎ¶º???ïÏù∏?????àÏäµ?àÎã§.
            <br />
            <br />
            <LoginLink to={PATHS.LOGIN}>Î°úÍ∑∏???òÍ∏∞</LoginLink>
          </EmptyMessage>
        )}
      </ContentWrapper>

      <Modal
        show={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        title={"Î£∏Î©î?¥Ìä∏ Îß§Ïπ≠ ?îÏ≤≠"}
        headerImageId={1}
        content={selectedMatching ? selectedMatching.message : ""}
        closeButtonText="?òÎùΩ"
        onCloseClick={handleAccept}
        secondaryButtonText="Í±∞Ï†à"
        onSecondaryButtonClick={handleReject}
      />
    </NotificationPageWrapper>
  );
};

export default NotificationPage;

const NotificationPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #777;
  font-size: 15px;
  line-height: 1.6;
`;

const LoginLink = styled(Link)`
  color: #0070f3;
  cursor: pointer;
  text-decoration: underline;
`;
