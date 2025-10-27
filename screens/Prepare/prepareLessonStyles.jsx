import { StyleSheet } from 'react-native';
import { colors, fontSizes } from '../../css';

const prepareLessonStyles = StyleSheet.create({
  // Main container and layout styles
  lessonSafeArea: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  lessonContainer: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },

  // Loading screen styles
  lessonLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8faf8',
  },
  lessonLoadingText: {
    marginTop: 16,
    fontSize: fontSizes.secondary,
    color: colors.muted,
  },

  // Header section with back button and titles
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    minHeight: 68,
  },
  lessonHeaderLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  lessonBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    borderRadius: 22,
    marginBottom: 4,
  },
  lessonHeaderContent: {
    flex: 1,
    justifyContent: 'center',
  },
  lessonModuleTitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  lessonPageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    lineHeight: 22,
  },
  lessonProgressContainer: {
    alignItems: 'center',
  },
  lessonProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  // Navigation tabs for lesson sections
  lessonNavTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  // New: horizontal menu for lesson pages (compact)
  lessonMenuContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 8,
    elevation: 1,
  },
  lessonMenuScroll: {
    // sits inside container
  },
  lessonMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 6,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    minWidth: 110,
  },
  // Compact icon-only variant for inactive tabs
  lessonMenuItemCompact: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 0,
  },
  lessonMenuItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  lessonMenuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
  },
  lessonMenuItemTextActive: {
    color: '#fff',
  },
  lessonNavTab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginHorizontal: 2,
    borderRadius: 6,
  },
  lessonNavTabActive: {
    backgroundColor: colors.primary,
  },
  lessonNavTabText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.secondary,
    marginTop: 2,
  },
  lessonNavTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // Main content area styles
  lessonContentArea: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  lessonScreenContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  lessonScrollContent: {
    paddingBottom: 8,
  },

  // Content card container styles
  lessonContentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    maxWidth: 900,
    alignSelf: 'center',
  },

  // Lesson content text styles
  lessonContentText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.secondary,
    textAlign: 'left',
  },

  // Video screen components
  lessonVideoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonVideoCaption: {
    fontSize: 13,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 6,
    padding: 5,
  },

  // Checklist screen styles
  lessonChecklistDescription: {
    fontSize: fontSizes.medium,
    color: colors.secondary,
    marginBottom: 16,
    textAlign: 'left',
    fontWeight: '600',
  },
  lessonChecklistContainer: {
    marginBottom: 16,
    backgroundColor: '#f8faf8',
    borderRadius: 8,
    padding: 4,
  },
  lessonChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  lessonChecklistItemCompleted: {
    backgroundColor: '#f0f7f0',
    borderColor: colors.primary,
  },
  lessonChecklistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: '#fff',
  },
  lessonCheckboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  lessonChecklistText: {
    fontSize: 15,
    color: colors.secondary,
    flex: 1,
    lineHeight: 20,
  },
  lessonChecklistTextCompleted: {
    color: '#666',
    textDecorationLine: 'line-through',
  },

  // Quiz screen components
  lessonQuizProgress: {
    marginBottom: 20,
  },
  lessonQuizProgressText: {
    fontSize: fontSizes.small,
    color: colors.secondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  lessonQuizProgressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  lessonQuizProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  lessonQuestionText: {
    fontSize: fontSizes.medium,
    fontWeight: '600',
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  lessonOptionsContainer: {
    gap: 12,
  },
  lessonOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  lessonOptionSelected: {
    backgroundColor: '#f0f7f0',
    borderColor: colors.primary,
  },
  lessonOptionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8faf8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  lessonOptionIndicatorSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  lessonOptionLetter: {
    fontSize: fontSizes.small,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  lessonOptionText: {
    fontSize: 15,
    color: colors.secondary,
    flex: 1,
    lineHeight: 20,
  },
  lessonOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Quiz results screen
  lessonScreenIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  lessonQuizResultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: colors.secondary,
  },
  lessonQuizResultScore: {
    fontSize: fontSizes.large,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  lessonQuizResultText: {
    fontSize: fontSizes.small,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Common reusable components
  lessonCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7f0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  lessonCompletedText: {
    fontSize: fontSizes.medium,
    color: colors.primary,
    fontWeight: '600',
  },
  lessonContinueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  lessonContinueButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  lessonContinueButtonText: {
    color: '#fff',
    fontSize: fontSizes.medium,
    fontWeight: 'bold',
  },
});

export default prepareLessonStyles;