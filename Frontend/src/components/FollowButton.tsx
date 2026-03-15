import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';


function useFollowToggle(initialFollowerCount: number, initialIsFollowing: boolean) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  useEffect(() => {
    setFollowerCount(initialFollowerCount);
  }, [initialFollowerCount]);

  const toggleFollow = () => {
    setIsFollowing((prev) => {
      const newState = !prev;
      setFollowerCount((count) => (newState ? count + 1 : count - 1));
      return newState;
    });
  };

  return {
    isFollowing,
    followerCount,
    toggleFollow,
  };
}

interface FollowButtonProps {
  initialFollowerCount: number;
  onFollowerCountChange?: (count: number) => void;
  onFollowClick?: () => void | Promise<void>;
  initialIsFollowing?: boolean;
}

export default function FollowButton({
  initialFollowerCount,
  onFollowerCountChange,
  onFollowClick,
  initialIsFollowing = false,
}: FollowButtonProps) {
  const { isFollowing, followerCount, toggleFollow } = useFollowToggle(
    initialFollowerCount,
    initialIsFollowing
  );

  const handleToggle = () => {
    if (onFollowClick) {
      void onFollowClick();
    }
    toggleFollow();
    if (onFollowerCountChange) {
      onFollowerCountChange(isFollowing ? followerCount - 1 : followerCount + 1);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      className={`
        relative overflow-hidden font-bold uppercase tracking-wider transition-all duration-300
        ${
          isFollowing
            ? 'bg-transparent border-2 border-blue text-blue hover:bg-blue/10'
            : 'bg-blue text-black border-2 border-blue hover:bg-blue/90'
        }
      `}
      size="lg"
    >
      {isFollowing ? (
        <>
          <UserCheck className="mr-2 h-5 w-5" />
          UnFollow
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-5 w-5" />
          Follow
        </>
      )}
    </Button>
  );
}
