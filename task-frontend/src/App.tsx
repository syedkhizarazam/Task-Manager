// import './containers/Task'
import { Task } from "./components/TaskList";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#2585C2",
    },
    secondary: {
      main: "#676767",
    },
    background: {
      default: "#EBEDF3",
    },
    text: {
      primary: "#00294D",
      secondary: "#00294D",
    },
  },
});

export const App = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ margin: "80px 20px 20px 15px", paddingLeft: 0 }}>
        <h1
          style={{
            fontSize: 35,
            fontFamily: "Consolas",
            fontWeight: 400,
            color: "#00294D",
            letterSpacing: "0.07em",
            verticalAlign: "middle",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <img
            style={{
              verticalAlign: "middle",
            }}
            src="images/logo.png"
            alt="Streamline Logo"
            width="100"
            height="100"
          />
          <br />
          Streamframe
        </h1>
        <Task />
      </div>
    </MuiThemeProvider>
  );
};
