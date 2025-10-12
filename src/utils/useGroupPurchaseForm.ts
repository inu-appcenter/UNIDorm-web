import { useState, useEffect } from "react";
import { CreateGroupOrderRequest } from "../types/grouporder.ts";
import {
  DESCRIPTION_MAX_LENGTH,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_SIZE_BYTES,
  TITLE_MAX_LENGTH,
} from "../constants/groupPurchase.ts";

const getDefaultDeadline = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = `${tomorrow.getFullYear()}년`;
  const month = `${tomorrow.getMonth() + 1}월`;
  const day = `${tomorrow.getDate()}일`;
  let hour = tomorrow.getHours();
  const ampm = hour >= 12 ? "오후" : "오전";
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  const minute = `${tomorrow.getMinutes().toString().padStart(2, "0")}분`;
  const hourStr = `${hour}시`;

  return { year, month, day, ampm, hour: hourStr, minute };
};

export function useGroupPurchaseForm(post: CreateGroupOrderRequest | null) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [purchaseLink, setPurchaseLink] = useState("");
  const [openchatLink, setOpenchatLink] = useState("");
  const [category, setCategory] = useState("배달");
  const [images, setImages] = useState<File[]>([]);
  const [deadline, setDeadline] = useState(getDefaultDeadline);
  const [dayOptions, setDayOptions] = useState<string[]>([]);

  useEffect(() => {
    if (post) {
      setIsEditMode(true);
      setTitle(post.title || "");
      setDescription(post.description || "");
      setPrice(post.price?.toString() || "");
      setPurchaseLink(post.link || "");
      setOpenchatLink(post.openChatLink || "");
      setCategory(post.groupOrderType || "배달");
      // 참고: 수정 모드 진입 시 post.deadline 값을 파싱해서
      // deadline 상태에 설정하는 로직이 추가로 필요할 수 있습니다.
    }
  }, [post]);

  const getLastDay = (yearStr: string, monthStr: string) => {
    const year = parseInt(yearStr.replace("년", ""));
    const month = parseInt(monthStr.replace("월", ""));
    return new Date(year, month, 0).getDate();
  };

  useEffect(() => {
    const lastDay = getLastDay(deadline.year, deadline.month);
    const days = Array.from({ length: lastDay }, (_, i) => `${i + 1}일`);
    setDayOptions(days);

    if (!days.includes(deadline.day)) {
      setDeadline((prev) => ({ ...prev, day: days[0] }));
    }
  }, [deadline.year, deadline.month]);

  const getDeadlineString = () => {
    const year = deadline.year.replace("년", "");
    const month = deadline.month.replace("월", "").padStart(2, "0");
    const day = deadline.day.replace("일", "").padStart(2, "0");
    let hour = parseInt(deadline.hour.replace("시", ""));
    if (deadline.ampm === "오후" && hour !== 12) hour += 12;
    if (deadline.ampm === "오전" && hour === 12) hour = 0;
    const minute = deadline.minute.replace("분", "").padStart(2, "0");
    return `${year}-${month}-${day}T${hour.toString().padStart(2, "0")}:${minute}:00`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const fileList = Array.from(e.target.files);
    const newFiles = [...images, ...fileList].filter(
      (file, index, self) =>
        index ===
        self.findIndex((f) => f.name === file.name && f.size === file.size),
    );

    if (newFiles.length > MAX_IMAGE_COUNT) {
      alert(`이미지는 최대 ${MAX_IMAGE_COUNT}장까지만 업로드 가능합니다.`);
      return;
    }

    for (const file of newFiles) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        alert(
          `이미지는 ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB 이하만 업로드 가능합니다.`,
        );
        return;
      }
    }
    setImages(newFiles.slice(0, MAX_IMAGE_COUNT));
  };

  const validateForm = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return false;
    }
    if (title.length > TITLE_MAX_LENGTH) {
      alert(`제목은 ${TITLE_MAX_LENGTH}자 이하로 입력해주세요.`);
      return false;
    }
    if (!price.trim() || isNaN(Number(price))) {
      alert("가격을 올바르게 입력해주세요.");
      return false;
    }
    if (Number(price) <= 0) {
      alert("가격은 1원 이상이어야 합니다.");
      return false;
    }
    if (!description.trim()) {
      alert("내용을 입력해주세요.");
      return false;
    }
    if (description.length > DESCRIPTION_MAX_LENGTH) {
      alert(`내용은 ${DESCRIPTION_MAX_LENGTH}자 이하로 입력해주세요.`);
      return false;
    }
    if (!purchaseLink.trim()) {
      alert("구매 링크를 입력해주세요.");
      return false;
    }
    if (!purchaseLink.trim()) {
      alert("구매 링크를 입력해주세요");
      return false;
    }
    // const urlPattern = /^https?:\/\/.+/;
    // if (!urlPattern.test(purchaseLink)) {
    //   alert("구매 링크는 http 또는 https로 시작해야 합니다.");
    //   return false;
    // }

    // open.kakao.com/o/ 다음에 최소 4글자 이상의 코드가 있는지 체크
    const kakaoOpenChatPattern =
      /^https?:\/\/open\.kakao\.com\/o\/[a-zA-Z0-9]{4,}.*$/;
    if (openchatLink && !kakaoOpenChatPattern.test(openchatLink)) {
      alert("오픈채팅방 링크는 http 또는 https로 시작해야 합니다.");
      return false;
    }
    return true;
  };

  const formData = {
    title,
    description,
    price,
    purchaseLink,
    openchatLink,
    category,
    images,
    deadline,
  };

  const formHandlers = {
    setTitle,
    setDescription,
    setPrice,
    setPurchaseLink,
    setOpenchatLink,
    setCategory,
    setImages,
    setDeadline,
    handleImageChange,
  };

  return {
    isEditMode,
    formData,
    formHandlers,
    dayOptions,
    getDeadlineString,
    validateForm,
  };
}
