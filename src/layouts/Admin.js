import '../assets/css/Admin.css';
import NavigationBar from "../components/NavigationBar.js";
import { Redirect, Switch } from "react-router-dom";
import { CreateStaycation, EditStaycation } from "../pages/CreateStaycation.js";
import Staycations from '../pages/Staycations';
import StaycationCategories from "../pages/StaycationCategories.js";
import Admins from '../pages/Admins';
import PrivateRoute from "../components/PrivateRoute.js";

function Admin() {
    return (
        <div className="d-flex flex-column justify-content-center">
            <NavigationBar />
            <div className="Admin-content">
                <Switch>
                    <PrivateRoute exact path="/admin/staycations"
                        component={Staycations} />
                    <PrivateRoute exact path="/admin/staycations/add"
                        component={CreateStaycation} />
                    <PrivateRoute exact path="/admin/staycations/edit"
                        component={EditStaycation} />
                    <PrivateRoute exact path="/admin/staycation-categories"
                        admin component={StaycationCategories} />
                    <PrivateRoute exact path="/admin/admins"
                        admin component={Admins} />
                    <Redirect from="/admin" to="/admin/staycations" />
                </Switch>
            </div>
        </div>
    );
}

export default Admin;