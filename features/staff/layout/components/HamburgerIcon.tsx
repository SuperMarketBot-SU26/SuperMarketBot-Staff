/**
 * HamburgerIcon — animated menu / close icon used in the StaffLayout header.
 *
 * The icon rotates 90° when toggling and cross-fades between menu ↔ close.
 * Driven entirely on the UI thread via Reanimated.
 */
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { MenuIcon, XIcon } from "@/shared/ui";

interface HamburgerIconProps {
  open: boolean;
  color: string;
}

export function HamburgerIcon({ open, color }: HamburgerIconProps) {
  const rotation = useSharedValue(open ? 90 : 0);
  rotation.value = withSpring(open ? 90 : 0, { stiffness: 400, damping: 30 });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {open ? (
        <XIcon size={18} color={color} />
      ) : (
        <MenuIcon size={18} color={color} />
      )}
    </Animated.View>
  );
}