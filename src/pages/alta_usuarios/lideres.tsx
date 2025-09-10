import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import GroupsIcon from "@mui/icons-material/Groups";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import SearchIcon from "@mui/icons-material/Search";

type Lider = { id: number | string; nombre: string; correo: string };
type Gerentes = string[];

// Helpers
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  let color = "#";
  for (let i = 0; i < 3; i++) color += ("00" + ((hash >> (i * 8)) & 0xff).toString(16)).slice(-2);
  return color;
};




const getInitials = (name: string = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

export const LideresGeneral: React.FC = () => {
  const [loadingLideres, setLoadingLideres] = useState(true);
  const [loadingGerentes, setLoadingGerentes] = useState(true);
  // const [lideres, setLideres] = useState<Lider[]>([]);
  // const [gerentes, setGerentes] = useState<Gerentes>([]);
  const [error, setError] = useState<string | null>(null);
  const [queryLideres, setQueryLideres] = useState("");
  const [queryGerentes, setQueryGerentes] = useState("");
  const [usuariosPermitidos, setUsuariosPermitidos] = useState<string[]>([]);
  const [usuariosSidebar, setUsuariosSidebar] = useState<Lider[]>([]);

  useEffect(() => {
    const fetchLideres = async () => {
      try {
        const { data } = await axios.get<Lider[]>(
          "https://desarrollotecnologicoar.com/api3/lideres_inmediatos/"
        );
        setUsuariosSidebar(data ?? []);
      } catch (e) {
        setError("Error al cargar líderes inmediatos.");
      } finally {
        setLoadingLideres(false);
      }
    };
    const fetchGerentes = async () => {
      try {
        const { data } = await axios.get<Gerentes>(
          "https://desarrollotecnologicoar.com/api3/usuarios_permitidos/"
        );
        setUsuariosPermitidos(data ?? []);
      } catch (e) {
        setError((prev) => prev ?? "Error al cargar gerentes."); // conserva el primero si ya hay
      } finally {
        setLoadingGerentes(false);
      }
    };
    fetchLideres();
    fetchGerentes();
  }, []);
  const filteredGerentes = useMemo(() => {
    const q = queryGerentes.trim().toLowerCase();
    if (!q) return usuariosPermitidos;
    return usuariosPermitidos.filter((g) => g.toLowerCase().includes(q));
  }, [usuariosPermitidos, queryGerentes]);

  const filteredLideres = useMemo(() => {
    const q = queryLideres.trim().toLowerCase();
    if (!q) return usuariosSidebar;
    return usuariosSidebar.filter(
      (l) =>
        l.nombre?.toLowerCase().includes(q) ||
        l.correo?.toLowerCase().includes(q)
    );
  }, [usuariosSidebar, queryLideres]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // opcional: fallback
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
        <Chip
          icon={<SupervisorAccountIcon />}
          label={`Gerentes: ${usuariosPermitidos.length}`}
          variant="outlined"
        />
        <Chip icon={<GroupsIcon />} label={`Líderes: ${usuariosSidebar.length}`} variant="outlined" />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* GERENTES */}
        <Grid item xs={12} md={5}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <CardHeader
              title="Listado de Gerentes"
              subheader="Usuarios con acceso administrativo"
            />
            {(loadingGerentes) && <LinearProgress />}

            <CardContent>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar gerente por correo…"
                value={queryGerentes}
                onChange={(e) => setQueryGerentes(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell>Correo</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingGerentes
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <TableRow key={`skg-${i}`}>
                            <TableCell>
                              <Skeleton width="70%" />
                            </TableCell>
                            <TableCell align="right">
                              <Skeleton width={24} />
                            </TableCell>
                          </TableRow>
                        ))
                      : filteredGerentes.map((gerente) => (
                          <TableRow key={gerente} hover>
                            <TableCell sx={{ fontFamily: "monospace" }}>{gerente}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Copiar correo">
                                <IconButton size="small" onClick={() => copy(gerente)}>
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    {!loadingGerentes && filteredGerentes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="body2" color="text.secondary">
                            Sin resultados.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* LÍDERES */}
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <CardHeader
              title="Líderes Inmediatos"
              subheader="Responsables por área / equipo"
            />
            {(loadingLideres) && <LinearProgress />}

            <CardContent>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nombre o correo…"
                value={queryLideres}
                onChange={(e) => setQueryLideres(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small" stickyHeader aria-label="tabla-lideres">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell>Persona</TableCell>
                      <TableCell>Correo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingLideres
                      ? Array.from({ length: 8 }).map((_, i) => (
                          <TableRow key={`skl-${i}`}>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Skeleton variant="circular" width={28} height={28} />
                                <Skeleton width="40%" />
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Skeleton width="60%" />
                            </TableCell>
                          </TableRow>
                        ))
                      : filteredLideres.map((lider) => (
                          <TableRow key={lider.id} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: stringToColor(lider.nombre || lider.correo),
                                  }}
                                >
                                  {getInitials(lider.nombre || lider.correo)}
                                </Avatar>
                                <Typography>{lider.nombre}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography sx={{ fontFamily: "monospace" }}>
                                  {lider.correo}
                                </Typography>
                                <Tooltip title="Copiar correo">
                                  <IconButton
                                    size="small"
                                    onClick={() => copy(lider.correo)}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                    {!loadingLideres && filteredLideres.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="body2" color="text.secondary">
                            Sin resultados.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">
        Última actualización: {new Date().toLocaleString()}
      </Typography>
    </Box>
  );
};
