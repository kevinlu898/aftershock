import { StyleSheet } from 'react-native';
import { colors, fontSizes } from '../../css';

const prepareStyles = StyleSheet.create({
  // Page content container
  contentContainer: {
    flex: 1,
  },

  // Text
  subtitle: {
    fontSize: fontSizes.medium,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 25,
  },
  moduleTitle: {
    fontSize: fontSizes.medium,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 2,
  },
  moduleDescription: {
    fontSize: fontSizes.small,
    color: colors.muted,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: fontSizes.medium,
    fontWeight: '600',
    color: colors.secondary,
  },
  progressPercent: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressText: {
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  lessonTitle: {
    fontSize: fontSizes.medium,
    color: colors.secondary,
    marginLeft: 12,
    flex: 1,
  },
  completedLesson: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  lessonDuration: {
    fontSize: fontSizes.small,
    color: colors.muted,
    marginRight: 8, 
  },

  // Containers
  overallProgress: {
    backgroundColor: '#fff', 
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Added margin to separate from progress bar
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  modulesList: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff', 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  lessonsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastLessonItem: {
    borderBottomWidth: 0,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonRight: {
    flexDirection: 'row',
    alignItems: 'center', // This ensures duration and arrow are on same line
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: fontSizes.medium,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: fontSizes.medium,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default prepareStyles;