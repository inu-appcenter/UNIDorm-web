import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  copyErrorToClipboard = () => {
    const errorText = `
${this.state.error?.name}
${this.state.error?.message}
${this.state.error?.stack}
    `;
    navigator.clipboard.writeText(errorText).then(
      () => alert("에러 메시지가 복사되었습니다."),
      () => alert("복사에 실패했습니다."),
    );
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red" }}>
          <h2>앱에서 오류가 발생했습니다.</h2>
          <p>개발자에게 아래 메시지를 전달해주세요.</p>
          <pre>{this.state.error?.name}</pre>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
          <button
            onClick={this.copyErrorToClipboard}
            style={{ marginLeft: "10px" }}
          >
            오류 복사
          </button>
          <br />
          <br />

          <button
            onClick={() => {
              window.location.href = "https://unidorm.inuappcenter.kr/home";
            }}
          >
            홈으로 가기
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
