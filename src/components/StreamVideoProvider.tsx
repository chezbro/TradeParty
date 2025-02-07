import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { PropsWithChildren, useEffect, useState } from "react";
import { useSupabaseUser } from "@/app/hooks/useSupabaseUser";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export function StreamVideoProvider({ children }: PropsWithChildren) {
  const [client, setClient] = useState<StreamVideoClient>();
  const { user } = useSupabaseUser();

  useEffect(() => {
    if (!user || !apiKey) return;

    const streamUser = {
      id: user.id,
      name: user.email || 'Anonymous',
      image: user.user_metadata?.avatar_url,
    };
    

    const client = new StreamVideoClient({
      apiKey,
      user: streamUser,
      tokenProvider: async () => {
        const response = await fetch('/api/stream/token');
        const { token } = await response.json();
        return token;
      },
    });

    setClient(client);

    return () => {
      client.disconnectUser();
    };
  }, [user]);

  if (!client) {
    return null;
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
} 