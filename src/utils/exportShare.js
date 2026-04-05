import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export const captureAndShare = async (viewRef) => {
  try {
    const uri = await captureRef(viewRef, { format: 'png', quality: 1 });
    const filename = `LoanHelper_${Date.now()}.png`;
    const dest = FileSystem.cacheDirectory + filename;
    await FileSystem.moveAsync({ from: uri, to: dest });
    await Sharing.shareAsync(dest, { mimeType: 'image/png', dialogTitle: 'Share Calculation' });
    return true;
  } catch {
    return false;
  }
};
