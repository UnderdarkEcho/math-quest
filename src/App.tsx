import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireProfile } from './components/RequireProfile';
import { ProfileProvider } from './context/ProfileContext';
import { CoursePath } from './pages/CoursePath';
import { CourseSelect } from './pages/CourseSelect';
import { Home } from './pages/Home';
import { Lesson } from './pages/Lesson';
import { Profile } from './pages/Profile';
import { SnapHub } from './pages/SnapHub';
import { SnapPlay } from './pages/SnapPlay';
import { TablesDrill } from './pages/TablesDrill';
import { TablesHub } from './pages/TablesHub';
import { Welcome } from './pages/Welcome';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Welcome />} />
            <Route
              path="home"
              element={
                <RequireProfile>
                  <Home />
                </RequireProfile>
              }
            />
            <Route
              path="select"
              element={
                <RequireProfile>
                  <CourseSelect />
                </RequireProfile>
              }
            />
            <Route
              path="tables"
              element={
                <RequireProfile>
                  <TablesHub />
                </RequireProfile>
              }
            />
            <Route
              path="tables/drill"
              element={
                <RequireProfile>
                  <TablesDrill />
                </RequireProfile>
              }
            />
            <Route
              path="snap"
              element={
                <RequireProfile>
                  <SnapHub />
                </RequireProfile>
              }
            />
            <Route
              path="snap/play"
              element={
                <RequireProfile>
                  <SnapPlay />
                </RequireProfile>
              }
            />
            <Route
              path="course/:courseId"
              element={
                <RequireProfile>
                  <CoursePath />
                </RequireProfile>
              }
            />
            <Route
              path="lesson/:courseId/:lessonIndex"
              element={
                <RequireProfile>
                  <Lesson />
                </RequireProfile>
              }
            />
            <Route
              path="profile"
              element={
                <RequireProfile>
                  <Profile />
                </RequireProfile>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  );
}
