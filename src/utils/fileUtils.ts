//URL을 받아 File 객체를 생성하는 비동기 함수
export async function urlToFile(
  url: string,
  imageName: string,
  mimeType: string,
): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], imageName, { type: mimeType });
}
