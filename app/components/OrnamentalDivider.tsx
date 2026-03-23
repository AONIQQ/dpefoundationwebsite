export default function OrnamentalDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center my-8 ${className}`}>
      <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-[#d4af36]" />
      <div className="mx-3 w-2 h-2 rotate-45 bg-[#d4af36]" />
      <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-[#d4af36]" />
    </div>
  )
}
