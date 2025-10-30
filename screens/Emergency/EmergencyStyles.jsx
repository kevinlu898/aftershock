import { StyleSheet } from 'react-native';
import { colors, fontSizes } from '../../css';

const emergencyStyles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 0,
  },
  header: {
    marginBottom: 24,
    marginTop: 0,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  emergencyBanner: {
    backgroundColor: colors.danger,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 24,
    gap: 10,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerContent: {
    flex: 1,
    minWidth: 0, // allows the text to wrap correctly inside flex row
    paddingRight: 12,
    alignItems: 'flex-start',
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: 0.25,
    flexShrink: 1,
    flexWrap: 'wrap',
    textAlign: 'left',
  },
  bannerSubtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
    textAlign: 'left',
  },
  localRiskButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 12,
    alignSelf: 'center',
    flexShrink: 0,
  },
  localRiskButtonText: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 13,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 24,
  },
  quickActionCard: {
    width: '50%',
    aspectRatio: 1,
    padding: 6,
  },
  quickActionContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  checklistsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 16,
  },
  moduleCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Modal backdrop + card (migrated from Emergency.jsx)
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  // Modal UI pieces
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontWeight: "700",
    fontSize: 24,
    color: colors.secondary,
    textAlign: "center",
  },
  modalContent: {
    width: "100%",
    maxHeight: 400,
  },
  modalScroll: {
    width: "100%",
    maxHeight: 400, 
  },

  // Contacts Styles
  contactsContainer: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    flex: 1,
  },
  contactName: {
    fontWeight: "600",
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 2,
  },
  contactDetail: {
    color: colors.muted,
    fontSize: 14,
  },
  contactAction: {
    padding: 8,
  },

  // Medical Info Styles
  medicalContainer: {
    gap: 16,
  },
  medCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: colors.secondary,
    marginLeft: 8,
  },
  medContent: {
    gap: 8,
  },
  medField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medLabel: {
    fontWeight: "500",
    color: colors.muted,
    fontSize: 14,
    width: '30%',
  },
  medValue: {
    flex: 1,
    color: colors.secondary,
    fontSize: 14,
    textAlign: 'right',
  },
  medSubtitle: {
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 4,
  },
  medDetail: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 2,
  },
  nestedMed: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },

  // Documents Styles
  documentsContainer: {
    gap: 12,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  docThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#e2e8f0",
  },
  docText: {
    flex: 1,
  },
  docTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: colors.secondary,
    marginBottom: 2,
  },
  docMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  docAction: {
    padding: 8,
  },

  // Info Content Styles
  infoContainer: {
    flex: 1,
  },
  infoSection: {
    gap: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 15,
    color: colors.secondary,
    lineHeight: 22,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef7ed',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
    marginLeft: 8,
    lineHeight: 20,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef7ed',
    borderRadius: 12,
    padding: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.muted,
    marginLeft: 12,
    lineHeight: 20,
  },

  // Checklist styles (migrated)
  lessonChecklistContainer: {
    marginBottom: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 4,
  },
  lessonChecklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  lessonChecklistItemCompleted: {
    backgroundColor: "#f0f9ff",
    borderColor: colors.primary + "40",
  },
  lessonChecklistLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  lessonCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#fff",
  },
  lessonCheckboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  lessonChecklistText: {
    fontSize: 15,
    color: colors.secondary,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  lessonChecklistTextCompleted: {
    color: "#64748b",
    textDecorationLine: "line-through",
  },
  moduleDescription: {
    fontSize: fontSizes.small,
    color: colors.muted,
    marginBottom: 0,
    lineHeight: 20,
  },

  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: colors.muted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default emergencyStyles;
