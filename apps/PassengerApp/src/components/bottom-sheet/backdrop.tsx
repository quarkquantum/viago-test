import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

/**
 * Reusable backdrop component for Gorhom BottomSheet
 * @param props - BottomSheetBackdropProps
 */
export const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0} // Hidden when sheet closed
    disappearsOnIndex={-1} // Appears when sheet opens
    pressBehavior="close" // Tap on backdrop closes sheet
  />
);
