/* Auto-generated design tokens from src/styles/tokens/tokens.json */
import { css } from "styled-components";

export const colors = {
  "main": {
    "main1": "#1677ff",
    "main3": "#ffd666",
    "main2": "#0958d9",
    "main4": "#ffc53d"
  },
  "bg": {
    "bg2": "#f7f7f7",
    "bg3": "#efefef",
    "bg1": "#ffffff"
  },
  "gray": {
    "gray1100": "#000000",
    "gray1000": "#242424",
    "gray900": "#333333",
    "gray800": "#3d3d3d",
    "gray700": "#555555",
    "gray600": "#6f6f6f",
    "gray500": "#8b8b8b",
    "gray400": "#a5a5a5",
    "gray300": "#c1c1c1",
    "gray200": "#dfdfdf",
    "gray100": "#efefef",
    "gray50": "#f7f7f7",
    "gray0": "#ffffff"
  },
  "blue": {
    "blue100": "#e6f4ff",
    "blue200": "#bae0ff",
    "blue300": "#91caff",
    "blue400": "#69b1ff",
    "blue500": "#4096ff",
    "blue600": "#1677ff",
    "blue700": "#0958d9",
    "blue800": "#003eb3",
    "blue900": "#002c8c",
    "blue1000": "#001d66"
  },
  "gold": {
    "gold100": "#fffbe6",
    "gold200": "#fff1b8",
    "gold300": "#ffe58f",
    "gold400": "#ffd666",
    "gold500": "#ffc53d",
    "gold600": "#faad14",
    "gold700": "#d48806",
    "gold800": "#ad6800",
    "gold900": "#874d00",
    "gold1000": "#613400"
  },
  "text": {
    "text1": "#242424",
    "text2": "#6f6f6f",
    "text3": "#a5a5a5",
    "text4": "#dfdfdf",
    "text5": "#f7f7f7"
  },
  "cta": {
    "default": "#0958d9",
    "hover": "#002c8c",
    "disabled": "#c1c1c1"
  },
  "status": {
    "positive": "#00bf40",
    "cautionary": "#ff9200",
    "destructive": "#ff4242"
  }
} as const;

export const fontFamilies = {
  "pretendard": "Pretendard"
} as const;

export const typographySpecs = {
  "display1": {
    "fontFamily": "Pretendard",
    "fontWeight": 700,
    "fontSize": "56px",
    "lineHeight": "1.2",
    "letterSpacing": "-0.006em"
  },
  "display2": {
    "fontFamily": "Pretendard",
    "fontWeight": 700,
    "fontSize": "40px",
    "lineHeight": "1.2",
    "letterSpacing": "-0.006em"
  },
  "title1": {
    "fontFamily": "Pretendard",
    "fontWeight": 700,
    "fontSize": "38px",
    "lineHeight": "1.2",
    "letterSpacing": "-0.006em"
  },
  "title2": {
    "fontFamily": "Pretendard",
    "fontWeight": 700,
    "fontSize": "28px",
    "lineHeight": "1.2",
    "letterSpacing": "-0.006em"
  },
  "title3": {
    "fontFamily": "Pretendard",
    "fontWeight": 600,
    "fontSize": "24px",
    "lineHeight": "1.2",
    "letterSpacing": "-0.006em"
  },
  "heading1": {
    "fontFamily": "Pretendard",
    "fontWeight": 600,
    "fontSize": "22px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "heading2": {
    "fontFamily": "Pretendard",
    "fontWeight": 600,
    "fontSize": "20px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "headline1": {
    "fontFamily": "Pretendard",
    "fontWeight": 700,
    "fontSize": "18px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "headline2": {
    "fontFamily": "Pretendard",
    "fontWeight": 700,
    "fontSize": "17px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "body1Normal": {
    "fontFamily": "Pretendard",
    "fontWeight": 600,
    "fontSize": "16px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "body1Reading": {
    "fontFamily": "Pretendard",
    "fontWeight": 400,
    "fontSize": "16px",
    "lineHeight": "1.6",
    "letterSpacing": "0em"
  },
  "body2Normal": {
    "fontFamily": "Pretendard",
    "fontWeight": 400,
    "fontSize": "15px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "body2Reading": {
    "fontFamily": "Pretendard",
    "fontWeight": 400,
    "fontSize": "15px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "label1Normal": {
    "fontFamily": "Pretendard",
    "fontWeight": 400,
    "fontSize": "14px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "label1Reading": {
    "fontFamily": "Pretendard",
    "fontWeight": 400,
    "fontSize": "14px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "label2": {
    "fontFamily": "Pretendard",
    "fontWeight": 400,
    "fontSize": "13px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "caption1": {
    "fontFamily": "Pretendard",
    "fontWeight": 400,
    "fontSize": "12px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  },
  "caption2": {
    "fontFamily": "Pretendard",
    "fontWeight": 400,
    "fontSize": "11px",
    "lineHeight": "1.5",
    "letterSpacing": "0em"
  }
} as const;

export type TypographyName = keyof typeof typographySpecs;

export const typography = {
  display1: css`
    font-family: '${typographySpecs.display1.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.display1.fontWeight};
    font-size: ${typographySpecs.display1.fontSize};
    line-height: ${typographySpecs.display1.lineHeight};
    letter-spacing: ${typographySpecs.display1.letterSpacing};
  `,
  display2: css`
    font-family: '${typographySpecs.display2.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.display2.fontWeight};
    font-size: ${typographySpecs.display2.fontSize};
    line-height: ${typographySpecs.display2.lineHeight};
    letter-spacing: ${typographySpecs.display2.letterSpacing};
  `,
  title1: css`
    font-family: '${typographySpecs.title1.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.title1.fontWeight};
    font-size: ${typographySpecs.title1.fontSize};
    line-height: ${typographySpecs.title1.lineHeight};
    letter-spacing: ${typographySpecs.title1.letterSpacing};
  `,
  title2: css`
    font-family: '${typographySpecs.title2.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.title2.fontWeight};
    font-size: ${typographySpecs.title2.fontSize};
    line-height: ${typographySpecs.title2.lineHeight};
    letter-spacing: ${typographySpecs.title2.letterSpacing};
  `,
  title3: css`
    font-family: '${typographySpecs.title3.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.title3.fontWeight};
    font-size: ${typographySpecs.title3.fontSize};
    line-height: ${typographySpecs.title3.lineHeight};
    letter-spacing: ${typographySpecs.title3.letterSpacing};
  `,
  heading1: css`
    font-family: '${typographySpecs.heading1.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.heading1.fontWeight};
    font-size: ${typographySpecs.heading1.fontSize};
    line-height: ${typographySpecs.heading1.lineHeight};
    letter-spacing: ${typographySpecs.heading1.letterSpacing};
  `,
  heading2: css`
    font-family: '${typographySpecs.heading2.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.heading2.fontWeight};
    font-size: ${typographySpecs.heading2.fontSize};
    line-height: ${typographySpecs.heading2.lineHeight};
    letter-spacing: ${typographySpecs.heading2.letterSpacing};
  `,
  headline1: css`
    font-family: '${typographySpecs.headline1.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.headline1.fontWeight};
    font-size: ${typographySpecs.headline1.fontSize};
    line-height: ${typographySpecs.headline1.lineHeight};
    letter-spacing: ${typographySpecs.headline1.letterSpacing};
  `,
  headline2: css`
    font-family: '${typographySpecs.headline2.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.headline2.fontWeight};
    font-size: ${typographySpecs.headline2.fontSize};
    line-height: ${typographySpecs.headline2.lineHeight};
    letter-spacing: ${typographySpecs.headline2.letterSpacing};
  `,
  body1Normal: css`
    font-family: '${typographySpecs.body1Normal.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.body1Normal.fontWeight};
    font-size: ${typographySpecs.body1Normal.fontSize};
    line-height: ${typographySpecs.body1Normal.lineHeight};
    letter-spacing: ${typographySpecs.body1Normal.letterSpacing};
  `,
  body1Reading: css`
    font-family: '${typographySpecs.body1Reading.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.body1Reading.fontWeight};
    font-size: ${typographySpecs.body1Reading.fontSize};
    line-height: ${typographySpecs.body1Reading.lineHeight};
    letter-spacing: ${typographySpecs.body1Reading.letterSpacing};
  `,
  body2Normal: css`
    font-family: '${typographySpecs.body2Normal.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.body2Normal.fontWeight};
    font-size: ${typographySpecs.body2Normal.fontSize};
    line-height: ${typographySpecs.body2Normal.lineHeight};
    letter-spacing: ${typographySpecs.body2Normal.letterSpacing};
  `,
  body2Reading: css`
    font-family: '${typographySpecs.body2Reading.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.body2Reading.fontWeight};
    font-size: ${typographySpecs.body2Reading.fontSize};
    line-height: ${typographySpecs.body2Reading.lineHeight};
    letter-spacing: ${typographySpecs.body2Reading.letterSpacing};
  `,
  label1Normal: css`
    font-family: '${typographySpecs.label1Normal.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.label1Normal.fontWeight};
    font-size: ${typographySpecs.label1Normal.fontSize};
    line-height: ${typographySpecs.label1Normal.lineHeight};
    letter-spacing: ${typographySpecs.label1Normal.letterSpacing};
  `,
  label1Reading: css`
    font-family: '${typographySpecs.label1Reading.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.label1Reading.fontWeight};
    font-size: ${typographySpecs.label1Reading.fontSize};
    line-height: ${typographySpecs.label1Reading.lineHeight};
    letter-spacing: ${typographySpecs.label1Reading.letterSpacing};
  `,
  label2: css`
    font-family: '${typographySpecs.label2.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.label2.fontWeight};
    font-size: ${typographySpecs.label2.fontSize};
    line-height: ${typographySpecs.label2.lineHeight};
    letter-spacing: ${typographySpecs.label2.letterSpacing};
  `,
  caption1: css`
    font-family: '${typographySpecs.caption1.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.caption1.fontWeight};
    font-size: ${typographySpecs.caption1.fontSize};
    line-height: ${typographySpecs.caption1.lineHeight};
    letter-spacing: ${typographySpecs.caption1.letterSpacing};
  `,
  caption2: css`
    font-family: '${typographySpecs.caption2.fontFamily}', sans-serif;
    font-weight: ${typographySpecs.caption2.fontWeight};
    font-size: ${typographySpecs.caption2.fontSize};
    line-height: ${typographySpecs.caption2.lineHeight};
    letter-spacing: ${typographySpecs.caption2.letterSpacing};
  `,
};

export const tokens = {
  colors,
  fontFamilies,
  typographySpecs,
  typography,
} as const;

export type Tokens = typeof tokens;
export default tokens;
