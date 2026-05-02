import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  activeTab: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  activeTabText: {
    color: Colors.BACKGROUND,
  },
  agencyInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  agencyName: {
    color: Colors.ACCENT,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  card: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 16,
    elevation: 2,
    margin: 4,
    marginBottom: 16,
  },
  cardHeader: {
    alignItems: 'center',
    borderBottomColor: Colors.ACCENT_FOREGROUND,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
  },
  controls: {
    marginBottom: 16,
  },
  dateInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dateText: {
    color: Colors.TEXT,
    fontFamily: Fonts.medium,
    fontSize: 12,
    opacity: 0.8,
  },
  dividerLine: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    height: 1,
    marginVertical: 4,
    width: 40,
  },
  durationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
    backgroundColor: Colors.ACCENT_FOREGROUND,
    padding: 18,
    borderRadius: 60,
  },
  emptyTitle: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.ACCENT,
    fontFamily: Fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
  },
  clearSearchButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
  },
  clearSearchText: {
    color: Colors.BACKGROUND,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: Colors.ACCENT_FOREGROUND,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
  },
  loader: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loaderText: {
    color: Colors.TEXT,
    fontFamily: Fonts.regular,
    marginTop: 12,
  },
  priceText: {
    color: Colors.PRIMARY,
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  stationContainer: {
    flex: 1,
  },
  stationName: {
    color: Colors.TEXT,
    fontFamily: Fonts.medium,
    fontSize: 12,
    opacity: 0.8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  tab: {
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabText: {
    color: Colors.TEXT,
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    // MarginBottom: 16,
    gap: 12,
  },
  timeText: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  tripRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 12,
    elevation: 0,
    height: 45,
  },
  searchBarInput: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    minHeight: 0,
  },
});

export default styles;
