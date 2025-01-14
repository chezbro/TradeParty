import { useParticipantViewContext, type VideoPlaceholderProps } from "@stream-io/video-react-sdk";

export const VideoPlaceholder = ({ style }: VideoPlaceholderProps) => {
  const { participant } = useParticipantViewContext();
  const defaultImage = `https://picsum.photos/seed/${participant.userId}/200/200`;

  return (
    <div 
      style={{ ...style }} 
      className="w-full h-full flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3">
        <img
          className="w-24 h-24 rounded-full border-2 border-white/10"
          src={participant.image || defaultImage}
          alt={participant.name || 'Anonymous'}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = defaultImage;
          }}
        />
        <span className="text-sm text-white/80 font-medium">
          {participant.name || 'Anonymous'}
        </span>
      </div>
    </div>
  );
}; 