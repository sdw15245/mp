// Suspense + ErrorBoundary 통합 래퍼. useSuspenseQuery 사용 페이지에서 로딩/에러 처리 자동화.
import { Suspense, type ReactNode } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { QueryErrorResetBoundary } from '@tanstack/react-query'

interface AsyncBoundaryProps {
  children: ReactNode
  loadingFallback?: ReactNode
  errorFallback?: (props: FallbackProps) => ReactNode
}

const DefaultLoading = () => (
  <div className="state-card" aria-busy="true" aria-live="polite">
    <div className="skeleton-stack">
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
    </div>
  </div>
)

const DefaultError = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className="state-card">
    <h2 className="wf-h3" style={{ marginBottom: 12 }}>데이터를 불러오지 못했습니다</h2>
    <p className="wf-sub" style={{ marginBottom: 18, marginInline: 'auto' }}>
      {error instanceof Error ? error.message : '알 수 없는 오류'}
    </p>
    <button className="wf-btn green sm" onClick={resetErrorBoundary}>
      다시 시도
    </button>
  </div>
)

function AsyncBoundary({
  children,
  loadingFallback = <DefaultLoading />,
  errorFallback = DefaultError,
}: AsyncBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} fallbackRender={errorFallback}>
          <Suspense fallback={loadingFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default AsyncBoundary
