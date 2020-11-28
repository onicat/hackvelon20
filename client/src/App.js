import {Redirect, Route, Switch, BrowserRouter as Router} from "react-router-dom";
import {makeStyles} from "@material-ui/core";

import RegistrationView from "./views/Registration";

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    backgroundColor: theme.palette.background.default
  }
}));

function App() {
  const classes = useStyles();
  
  return (
    <Router>
      <div className={classes.root}>
        <Switch>
          <Route path='/registration/:channelId/:userId'>
            <RegistrationView/>
          </Route>
        </Switch>
      </div> 
    </Router>
  );
}

export default App;
