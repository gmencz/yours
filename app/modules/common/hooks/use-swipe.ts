import { Dimensions, GestureResponderEvent } from "react-native";
const windowWidth = Dimensions.get("window").width;

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  rangeOffset = 4,
}: {
  onSwipeLeft?: VoidFunction;
  onSwipeRight?: VoidFunction;
  rangeOffset?: number;
}) {
  let firstXPosition = 0;

  let x = 0; // current x pos
  let sx = x; // previous x pos

  // set user touch start position
  function onTouchStart(e: GestureResponderEvent) {
    firstXPosition = e.nativeEvent.pageX;
  }

  // when touch ends check for swipe directions
  function onTouchEnd(e: GestureResponderEvent) {
    // get touch position and screen size
    const currentXPosition = e.nativeEvent.pageX;
    const range = windowWidth / rangeOffset;

    // check if position is growing positively and has reached specified range
    if (currentXPosition - firstXPosition > range) {
      onSwipeRight?.();
    }
    // check if position is growing negatively and has reached specified range
    else if (firstXPosition - currentXPosition > range) {
      onSwipeLeft?.();
    }
  }

  return { onTouchStart, onTouchEnd };
}
