import { FC, memo, useState, useEffect } from 'react';
import supabase from '@/lib/supabase-client';

interface MeetingRoomProps {
  shareChart: (symbol: string) => void;
  sharedCharts: string[];
  socket: any; // Replace with proper socket type if available
  meetingName: string;
}

const MeetingRoom: FC<MeetingRoomProps> = memo(({ shareChart, sharedCharts, socket, meetingName }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  return (
    <div className="meeting-room">
      <h2>Meeting: {meetingName}</h2>
      <div className="shared-charts">
        {sharedCharts.map((symbol) => (
          <div key={symbol} className="shared-chart">
            {symbol}
          </div>
        ))}
      </div>
    </div>
  );
});

MeetingRoom.displayName = 'MeetingRoom';

export default MeetingRoom; 