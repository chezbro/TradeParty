import { FC, memo } from 'react';
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useCall } from "@stream-io/video-react-sdk";

interface MeetingRoomProps {
    shareChart: (chartData: any) => void;
    sharedCharts: SharedChart[];
    socket: Socket | null;
    meetingName: string;
}

export const MeetingRoom: FC<MeetingRoomProps> = memo(({ shareChart, sharedCharts, socket, meetingName }) => {
    // ... (existing MeetingRoom component code)
});

MeetingRoom.displayName = 'MeetingRoom'; 