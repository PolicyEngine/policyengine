import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { CountryContext } from "../../countries";
import MainNavigation from "./mainNavigation";

export function Header(props) {
  const country = useContext(CountryContext);
  let navigation;
  if (props.title || props.noTabs) {
    navigation = <MainNavigation title={props.title} noTabs={props.noTabs} />;
  } else {
    navigation = (
      <Routes>
        <Route path={`policy`} element={<MainNavigation selected="policy" />} />
        <Route
          path={`population-impact`}
          element={<MainNavigation selected="population-impact" />}
        />
        <Route
          path={`household`}
          element={<MainNavigation selected="household" />}
        />
        <Route
          path={"/"}
          element={<MainNavigation selected={window.location.pathname} />}
        />
      </Routes>
    );
  }
  return (
    <div
      style={{
        backgroundColor: "#2c6496",
        position: "fixed",
        top: 0,
        width: "100vw",
      }}
    >
      {navigation}
    </div>
  );
}
