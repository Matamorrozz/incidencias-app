import { GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { Image } from "antd";

import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";

import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostList,
  BlogPostShow,
} from "./pages/incidencias";
// import {
//   CategoryCreate,
//   CategoryEdit,
//   CategoryList,
//   CategoryShow,
// } from "./pages/categories";

// Importaciones para Firebase
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig"; // Asegúrate de que tu archivo firebaseConfig.js esté bien configurado
import Login from "./login"; // El componente de Login que creaste

function App() {
  const [authenticated, setAuthenticated] = useState(false); // Estado de autenticación
  const [loading, setLoading] = useState(true); // Para mostrar un estado de carga

  useEffect(() => {
    // Verifica el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true); // Si el usuario está autenticado
      } else {
        setAuthenticated(false); // Si no hay usuario
      }
      setLoading(false); // Finaliza la carga
    });

    // Limpieza de listener al desmontar
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Mientras se verifica el estado de autenticación
    return <div>Cargando...</div>;
  }

  const LogoTitle = () => (
    <div style={{ display: "flex", alignItems: "center", padding: "10px" }}>
      <Image
        src="/ar_logo.png" // Cambia esta ruta a la ruta de tu logo
        alt="Logo"
        width={150} // Ajusta el tamaño del logo si es necesario
        preview={false} // Para evitar la vista previa de la imagen en Ant Design
      />
     
    </div>
  );


  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              {authenticated ? (
                // Si el usuario está autenticado, renderiza Refine
                <Refine
                  dataProvider={dataProvider("https://desarrollotecnologicoar.com/api3")}
                  notificationProvider={useNotificationProvider}
                  routerProvider={routerBindings}
                  resources={[
                    {
                      name: "incidencias",
                      list: "/incidencias",
                      create: "/incidencias/create",
                      edit: "/incidencias/edit/:id",
                      show: "/incidencias/show/:id",
                      meta: {
                        canDelete: true,
                      },
                    },
                    // {
                    //   name: "categories",
                    //   list: "/categories",
                    //   create: "/categories/create",
                    //   edit: "/categories/edit/:id",
                    //   show: "/categories/show/:id",
                    //   meta: {
                    //     canDelete: true,
                    //   },
                    // },
                  ]}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: "rG27AD-YONvIw-urDRkU",
                  }}
                >
                  <Routes>
                    <Route
                      element={
                        <ThemedLayoutV2
                          Header={() => <Header sticky />}
                          Title={() => <LogoTitle />} // Aquí pasamos el logo en el título
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      }
                    >
                      <Route
                        index
                        element={<NavigateToResource resource="blog_posts" />}
                      />
                      <Route path="/incidencias">
                        <Route index element={<BlogPostList />} />
                        <Route path="create" element={<BlogPostCreate />} />
                        <Route path="edit/:id" element={<BlogPostEdit />} />
                        <Route path="show/:id" element={<BlogPostShow />} />
                      </Route>
                      {/* <Route path="/categories">
                        <Route index element={<CategoryList />} />
                        <Route path="create" element={<CategoryCreate />} />
                        <Route path="edit/:id" element={<CategoryEdit />} />
                        <Route path="show/:id" element={<CategoryShow />} />
                      </Route> */}
                      <Route path="*" element={<ErrorComponent />} />
                    </Route>
                  </Routes>

                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
              ) : (
                // Si no está autenticado, redirige al Login
                <Login />
              )}
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
