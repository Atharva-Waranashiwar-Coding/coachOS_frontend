import { Navigate, Route, Routes } from "react-router-dom";
import { AthleteCreatePage } from "../features/athletes/pages/AthleteCreatePage";
import { AthleteEditPage } from "../features/athletes/pages/AthleteEditPage";
import { AthleteListPage } from "../features/athletes/pages/AthleteListPage";
import { AthleteProfilePage } from "../features/athletes/pages/AthleteProfilePage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SignupPage } from "../features/auth/pages/SignupPage";
import { AcceptInvitationPage } from "../features/auth/pages/AcceptInvitationPage";
import { AthleteDashboardPage } from "../features/athlete-dashboard/AthleteDashboardPage";
import { AthleteFeedbackDetailPage } from "../features/athlete-feedback/AthleteFeedbackDetailPage";
import { AthleteFeedbackPage } from "../features/athlete-feedback/AthleteFeedbackPage";
import { AthleteDrillDetailPage } from "../features/athlete-drills/AthleteDrillDetailPage";
import { AthleteDrillsPage as AthleteSelfDrillsPage } from "../features/athlete-drills/AthleteDrillsPage";
import { AthleteGoalsPage } from "../features/athlete-goals/AthleteGoalsPage";
import { AthleteProfilePage as AthleteSelfProfilePage } from "../features/athlete-profile/AthleteProfilePage";
import { AthleteTimelinePage } from "../features/athlete-timeline/AthleteTimelinePage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { AssignmentDetailPage } from "../features/drills/pages/AssignmentDetailPage";
import { AthleteDrillsPage } from "../features/drills/pages/AthleteDrillsPage";
import { DrillDetailPage } from "../features/drills/pages/DrillDetailPage";
import { DrillEditorPage } from "../features/drills/pages/DrillEditorPage";
import { DrillLibraryPage } from "../features/drills/pages/DrillLibraryPage";
import { NewReviewPage } from "../features/ai-review/pages/NewReviewPage";
import { ReviewDetailPage } from "../features/ai-review/pages/ReviewDetailPage";
import { ReviewEditPage } from "../features/ai-review/pages/ReviewEditPage";
import { ReviewHistoryPage } from "../features/ai-review/pages/ReviewHistoryPage";
import { ReviewPreviewPage } from "../features/ai-review/pages/ReviewPreviewPage";
import { ReviewsPage } from "../features/ai-review/pages/ReviewsPage";
import { AthleteAppLayout } from "../layouts/AthleteAppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { CoachAppLayout } from "../layouts/CoachAppLayout";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PublicOnlyRoute } from "../routes/PublicOnlyRoute";
import { RequireAthleteRoute } from "../routes/RequireAthleteRoute";
import { RequireCoachRoute } from "../routes/RequireCoachRoute";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { AthleteInsightsPage } from "../features/insights/AthleteInsightsPage";
import { AttentionInsightsPage } from "../features/insights/AttentionInsightsPage";
import { CoachInsightsPage } from "../features/insights/CoachInsightsPage";
import { VideosPage } from "../features/videos/VideosPage";
import { AssistantPage } from "../features/assistant/AssistantPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/invitations/accept"
            element={<AcceptInvitationPage />}
          />
        </Route>
      </Route>
      <Route element={<RequireCoachRoute />}>
        <Route element={<CoachAppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/insights" element={<CoachInsightsPage />} />
          <Route
            path="/insights/attention"
            element={<AttentionInsightsPage />}
          />
          <Route path="/drills" element={<DrillLibraryPage />} />
          <Route path="/drills/new" element={<DrillEditorPage />} />
          <Route path="/drills/:drillId" element={<DrillDetailPage />} />
          <Route path="/drills/:drillId/edit" element={<DrillEditorPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/reviews/:reviewId" element={<ReviewDetailPage />} />
          <Route path="/reviews/:reviewId/edit" element={<ReviewEditPage />} />
          <Route
            path="/reviews/:reviewId/preview"
            element={<ReviewPreviewPage />}
          />
          <Route
            path="/reviews/:reviewId/history"
            element={<ReviewHistoryPage />}
          />
          <Route
            path="/athletes/:athleteId/reviews"
            element={<ReviewsPage />}
          />
          <Route
            path="/videos/:videoId/reviews/new"
            element={<NewReviewPage />}
          />
          <Route
            path="/videos/:videoId/athletes/:athleteId/reviews/new"
            element={<NewReviewPage />}
          />
          <Route path="/athletes" element={<AthleteListPage />} />
          <Route path="/athletes/new" element={<AthleteCreatePage />} />
          <Route path="/athletes/:athleteId" element={<AthleteProfilePage />} />
          <Route
            path="/athletes/:athleteId/insights"
            element={<AthleteInsightsPage />}
          />
          <Route
            path="/athletes/:athleteId/drills"
            element={<AthleteDrillsPage />}
          />
          <Route
            path="/athletes/:athleteId/drills/:assignmentId"
            element={<AssignmentDetailPage />}
          />
          <Route
            path="/athletes/:athleteId/edit"
            element={<AthleteEditPage />}
          />
        </Route>
      </Route>
      <Route element={<RequireAthleteRoute />}>
        <Route element={<AthleteAppLayout />}>
          <Route
            path="/athlete"
            element={<Navigate to="/athlete/dashboard" replace />}
          />
          <Route path="/athlete/dashboard" element={<AthleteDashboardPage />} />
          <Route path="/athlete/feedback" element={<AthleteFeedbackPage />} />
          <Route
            path="/athlete/feedback/:reviewId"
            element={<AthleteFeedbackDetailPage />}
          />
          <Route path="/athlete/drills" element={<AthleteSelfDrillsPage />} />
          <Route
            path="/athlete/drills/:assignmentId"
            element={<AthleteDrillDetailPage />}
          />
          <Route path="/athlete/timeline" element={<AthleteTimelinePage />} />
          <Route path="/athlete/goals" element={<AthleteGoalsPage />} />
          <Route path="/athlete/profile" element={<AthleteSelfProfilePage />} />
        </Route>
      </Route>
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
