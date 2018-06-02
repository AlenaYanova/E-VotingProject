import {
    createStackNavigator,
} from 'react-navigation';
import SearchPage from './SearchPage';
import ElectionStartPage from './ElectionStartPage';
import BulletinPage from './BulletinPage'
import CastOrAuditPage from './CastOrAuditPage';
import AuthorizationPage from './AuthorizationPage'
import ResultPage from './ResultPage'
import BoardPage from './BoardPage'



const App = createStackNavigator({
    Home: { screen: SearchPage },
    Board: {screen: BoardPage},
    Result: {screen: ResultPage},
    Authorization: {screen: AuthorizationPage},
    CastOrAudit: {screen: CastOrAuditPage},
    Bulletin : {screen: BulletinPage},
    ElectionHello: {screen: ElectionStartPage}
});
export default App;
