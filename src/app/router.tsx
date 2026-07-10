import { Navigate, Route, Routes } from "react-router-dom";
import { AthleteCreatePage } from "../features/athletes/pages/AthleteCreatePage";
import { AthleteEditPage } from "../features/athletes/pages/AthleteEditPage";
import { AthleteListPage } from "../features/athletes/pages/AthleteListPage";
import { AthleteProfilePage } from "../features/athletes/pages/AthleteProfilePage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { NewReviewPage } from "../features/ai-review/pages/NewReviewPage";
import { ReviewDetailPage } from "../features/ai-review/pages/ReviewDetailPage";
import { ReviewsPage } from "../features/ai-review/pages/ReviewsPage";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { PublicOnlyRoute } from "../routes/PublicOnlyRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/reviews/:reviewId" element={<ReviewDetailPage />} />
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
            path="/athletes/:athleteId/edit"
            element={<AthleteEditPage />}
          />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
