import React, { useEffect, useState } from 'react';
import { StreamVideoClient } from '@stream-io/video-client';

const StreamVideoProvider = ({ children }: { children: React.ReactNode }) => {
  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(null);
  const [streamToken, setStreamToken] = useState<string | null>(null);

  useEffect(() => {
    const setupClient = async () => {
      try {
        const client = StreamVideoClient.getOrCreateInstance(process.env.NEXT_PUBLIC_STREAM_KEY!, {
          token: streamToken!,
          options: {
            video: {
              encoderConfig: {
                width: 1280,
                height: 720,
                bitrateMax: 1500000,
                bitrateMin: 500000,
              }
            }
          }
        });

        setStreamClient(client);
      } catch (error) {
        console.error('Error setting up Stream client:', error);
      }
    };

    if (streamToken) {
      setupClient();
    }

    // Cleanup function
    return () => {
      if (streamClient) {
        streamClient.disconnectUser();
      }
    };
  }, [streamToken]);

  return (
    <div>
      {/* Rest of the component content */}
    </div>
  );
};

export default StreamVideoProvider; 