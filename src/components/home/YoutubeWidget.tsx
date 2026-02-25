import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import Divider from "@/components/common/Divider";
import Skeleton from "@/components/common/Skeleton";
import SortDropBox from "@/components/common/SortDropBox";

interface VideoData {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CHANNEL_ID = "UCrpqEmMWCOg6P8FSk6mN5Hw";

// 유튜브 영상 데이터 페칭 함수
const fetchYoutubeVideos = async (sort: string): Promise<VideoData[]> => {
  const orderParam = sort === "date" ? "date" : "viewCount";

  const searchResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=id&order=${orderParam}&maxResults=3&type=video`,
  );
  const searchData = await searchResponse.json();

  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  const targetItems = searchData.items.slice(0, 3);
  const videoIds = targetItems.map((item: any) => item.id.videoId).join(",");

  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=snippet,statistics`,
  );
  const videosData = await videosResponse.json();

  const formattedVideos = videosData.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt,
    viewCount: item.statistics.viewCount,
  }));

  return formattedVideos.slice(0, 3);
};

const YoutubeListWidget = () => {
  const [sort, setSort] = useState("date");

  // 리액트 쿼리 설정
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["youtubeVideos", sort],
    queryFn: () => fetchYoutubeVideos(sort),
    staleTime: 1000 * 60 * 60,
  });

  const formatViewCount = (count: string) => {
    const num = parseInt(count, 10);
    if (num >= 10000) return `${(num / 10000).toFixed(1)}만회`;
    return `${num.toLocaleString()}회`;
  };

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  return (
    <>
      <SortDropBox sort={sort} setSort={setSort} />

      {isLoading ? (
        <ListContainer>
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <VideoItem style={{ cursor: "default" }}>
                {/* 썸네일 스켈레톤 */}
                <Skeleton width={120} height={68} />

                <InfoWrapper>
                  <TitleSkeletonWrapper>
                    {/* 제목 스켈레톤 */}
                    <Skeleton width="100%" height={15} />
                    <Skeleton width="70%" height={15} />
                  </TitleSkeletonWrapper>

                  {/* 날짜 조회수 스켈레톤 */}
                  <Skeleton width="40%" height={12} />
                </InfoWrapper>
              </VideoItem>
              {/* 구분선 표시 */}
              {i < 2 && <Divider margin={"16px 0"} />}
            </div>
          ))}
        </ListContainer>
      ) : (
        // 데이터 영역
        <ListContainer>
          {videos.map((video, i) => (
            <div key={video.id}>
              <VideoItem onClick={() => handleVideoClick(video.id)}>
                <Thumbnail src={video.thumbnailUrl} alt={video.title} />
                <InfoWrapper>
                  <VideoTitle
                    dangerouslySetInnerHTML={{ __html: video.title }}
                  />
                  <MetaInfo>
                    <InfoText>
                      조회수 {formatViewCount(video.viewCount)}
                    </InfoText>
                    <DividerDot>•</DividerDot>
                    <InfoText className="date">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </InfoText>
                  </MetaInfo>
                </InfoWrapper>
              </VideoItem>
              {videos.length - 1 > i && <Divider margin={"16px 0"} />}
            </div>
          ))}
        </ListContainer>
      )}
    </>
  );
};

export default YoutubeListWidget;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const VideoItem = styled.div`
  display: flex;
  width: 100%;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const Thumbnail = styled.img`
  width: 120px;
  height: 68px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: #eee;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 12px;
  padding: 2px 0;
  flex: 1;
`;

// 스켈레톤 래퍼
const TitleSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const VideoTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InfoText = styled.span`
  font-size: 11px;
  color: #888;
  &.date {
    color: #4071b9;
    font-weight: 500;
  }
`;

const DividerDot = styled.span`
  font-size: 10px;
  color: #ccc;
`;
