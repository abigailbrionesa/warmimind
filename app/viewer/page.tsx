import ViewerPage from '../../components/ViewerPage';
import { LanguageProvider } from '../../context/LanguageContext';

export default function Page() {
  return (
    <LanguageProvider>
      <ViewerPage />
    </LanguageProvider>
  );
}
