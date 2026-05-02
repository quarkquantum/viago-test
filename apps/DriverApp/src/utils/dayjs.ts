// biome-ignore lint/style/noExportedImports: <explanation>
import dayjs from '@repo/design-system/mobile/utils/dayjs';
import i18n from '@/i18n';

dayjs.locale(i18n.language);

export default dayjs;
