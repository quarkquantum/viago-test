import { useNavigation } from '@react-navigation/native';
import { Colors } from '@repo/shared';
import type { LucideIcon } from 'lucide-react-native';
import { CalendarCheck, CheckCircle, ChevronUpCircle, Rocket, Search } from 'lucide-react-native';
import type React from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar, Text, View } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import type { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import PagerView from 'react-native-pager-view';
import { Button } from 'react-native-paper';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withSpring } from 'react-native-reanimated';

import type { RootNav } from '@/navigation/root-navigator';
import { DOT_SIZE, styles } from './styles';

type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const onboardingSlides: OnboardingSlide[] = [
  {
    description: 'screens.onboarding.findCheapTrips.description',
    icon: Search,
    id: '1',
    title: 'screens.onboarding.findCheapTrips.title',
  },
  {
    description: 'screens.onboarding.reserveSeat.description',
    icon: CalendarCheck,
    id: '2',
    title: 'screens.onboarding.reserveSeat.title',
  },
  {
    description: 'screens.onboarding.onlinePayment.description',
    icon: CheckCircle,
    id: '3',
    title: 'screens.onboarding.onlinePayment.title',
  },
  {
    description: 'screens.onboarding.travelWithEase.description',
    icon: Rocket,
    id: '4',
    title: 'screens.onboarding.travelWithEase.title',
  },
  {
    description: 'screens.onboarding.getStarted.description',
    icon: ChevronUpCircle,
    id: '5',
    title: 'screens.onboarding.getStarted.title',
  },
];

type DotItemProps = {
  index: number;
  currentPage: SharedValue<number>;
};

const DotItem: React.FC<DotItemProps> = ({ index, currentPage }) => {
  const isActive = useDerivedValue(() => currentPage.value === index);

  const dotStyle = useAnimatedStyle(() => ({
    backgroundColor: Colors.ACCENT,
    opacity: withSpring(isActive.value ? 1 : 0.5, {
      damping: 12,
      mass: 0.5,
    }),
    width: withSpring(isActive.value ? DOT_SIZE * 4 : DOT_SIZE, {
      damping: 12,
      mass: 0.5,
    }),
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
};

type PaginationProps = {
  currentPage: SharedValue<number>;
};

const Pagination: React.FC<PaginationProps> = ({ currentPage }) => (
  <View style={styles.paginationContainer}>
    {onboardingSlides.map((_, index) => (
      <DotItem currentPage={currentPage} index={index} key={_.id} />
    ))}
  </View>
);

const storage = createMMKV();

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<RootNav>();
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState<number>(0);
  const pagerRef = useRef<PagerView>(null);
  const currentPageShared = useSharedValue<number>(0);

  const handleNext = () => {
    if (currentPage < onboardingSlides.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      storage.set('@onboarding_complete', true);
      navigation.navigate('MainTabs');
    }
  };

  const handleSkip = () => {
    pagerRef.current?.setPage(onboardingSlides.length - 1);
    storage.set('@onboarding_complete', true);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" translucent={false} />
      <PagerView
        initialPage={0}
        onPageSelected={(e: PagerViewOnPageSelectedEvent) => {
          setCurrentPage(e.nativeEvent.position);
          currentPageShared.value = e.nativeEvent.position;
        }}
        ref={pagerRef}
        style={styles.pagerView}
      >
        {onboardingSlides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <slide.icon color={Colors.ACCENT} size={80} style={styles.icon} />
            <Text style={styles.title}>{t(slide.title)}</Text>
            <Text style={styles.description}>{t(slide.description)}</Text>
          </View>
        ))}
      </PagerView>

      <Pagination currentPage={currentPageShared} />

      <View style={styles.buttonContainer}>
        <Button mode="text" onPress={handleSkip}>
          {t('common.ignore')}
        </Button>
        <Button mode="contained" onPress={handleNext}>
          {t(currentPage === onboardingSlides.length - 1 ? 'common.start' : 'common.next')}
        </Button>
      </View>
    </View>
  );
};
