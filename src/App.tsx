import { GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
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
} from "./pages/blog-posts";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";

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

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              {authenticated ? (
                // Si el usuario está autenticado, renderiza Refine
                <Refine
                  dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
                  notificationProvider={useNotificationProvider}
                  routerProvider={routerBindings}
                  resources={[
                    {
                      name: "blog_posts",
                      list: "/blog-posts",
                      create: "/blog-posts/create",
                      edit: "/blog-posts/edit/:id",
                      show: "/blog-posts/show/:id",
                      meta: {
                        canDelete: true,
                      },
                    },
                    {
                      name: "categories",
                      list: "/categories",
                      create: "/categories/create",
                      edit: "/categories/edit/:id",
                      show: "/categories/show/:id",
                      meta: {
                        canDelete: true,
                      },
                    },
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
                          Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      }
                    >
                      <Route
                        index
                        element={<NavigateToResource resource="blog_posts" />}
                      />
                      <Route path="/blog-posts">
                        <Route index element={<BlogPostList />} />
                        <Route path="create" element={<BlogPostCreate />} />
                        <Route path="edit/:id" element={<BlogPostEdit />} />
                        <Route path="show/:id" element={<BlogPostShow />} />
                      </Route>
                      <Route path="/categories">
                        <Route index element={<CategoryList />} />
                        <Route path="create" element={<CategoryCreate />} />
                        <Route path="edit/:id" element={<CategoryEdit />} />
                        <Route path="show/:id" element={<CategoryShow />} />
                      </Route>
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
