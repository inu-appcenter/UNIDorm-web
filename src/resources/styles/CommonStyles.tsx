import { createGlobalStyle } from "styled-components";

const CommonStyles = createGlobalStyle`
  //이 안에 전체 프로젝트에 적용될 css를 작성하면 됩니다~!

  @font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff') format('woff');
    font-weight: 400;
    font-display: swap;
  }

  html, body {
    -webkit-text-size-adjust : none; /* , A2| */
    -ms-text-size-adjust : none; /* IE */
    -moz-text-size-adjust : none; /* 01= */
    
    font-family: "Pretendard", sans-serif;
  }
  
  body {
    margin: 0;
    -ms-overflow-style: none;
  }
  a, button, img {
    //cursor: url('/pointers/cursor-pointer.svg'), pointer;
    cursor: pointer;
  }

  * {
    -webkit-tap-highlight-color: rgba(128, 128, 128, 0.2); /* 옅은 회색 */
  }


`;

export default CommonStyles;
