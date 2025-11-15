interface LoadingButtonProps {
  isLoading: boolean
  disabled: boolean
  loadingText: string
  children: string
}

export function LoadingButton({
  isLoading,
  disabled,
  loadingText,
  children,
}: LoadingButtonProps) {
  return (
    <button
      type="submit"
      className="w-full h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  )
}
