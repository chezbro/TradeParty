import { FC, memo, useState, useEffect } from 'react';
import supabase from '@/lib/supabase-client';
import { CallControls, PaginatedGridLayout } from "@stream-io/video-react-sdk";
import { useRouter } from 'next/navigation';

interface MeetingRoomProps {
  shareChart: (symbol: string) => void;
  sharedCharts: string[];
  socket: any;
  meetingName: string;
}

// Add type definition for CallControls
type ExtendedCallControlsProps = {
  className?: string;
} & React.ComponentProps<typeof CallControls>;

const MeetingRoom: FC<MeetingRoomProps> = memo(({ shareChart, sharedCharts, socket, meetingName }) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  const handleLeave = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Video Grid */}
      <div className="flex-1">
        <PaginatedGridLayout />
      </div>
      
      {/* Controls Bar */}
      <div className="p-4 bg-gray-900/90 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <CallControls
            onLeave={handleLeave}
            className="flex items-center gap-3 p-2"
          />
        </div>
      </div>
    </div>
  );
});

MeetingRoom.displayName = 'MeetingRoom';

export default MeetingRoom; 