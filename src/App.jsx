import { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react';
import {
  MapPin, Bus, Clock, Star, Search, Moon, Sun, Navigation, AlertTriangle,
  RefreshCw, ChevronRight, X, Heart, Map as MapIcon, Bell, BellOff, Share2,
  History, Settings, Locate, ChevronDown, Filter, Zap, Info,
  ExternalLink, Wifi, WifiOff, Download, Check, CloudOff, List, Home, Briefcase
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import Fuse from 'fuse.js';

// ═══════════════════════════════════════════════════════════════════════════
// DATOS DE SURBUS ALMERÍA
// ═══════════════════════════════════════════════════════════════════════════

const PARADAS = [{"id": 1, "nombre": "Plaza del Quemadero", "lat": 36.8462014232588, "lng": -2.46708068814807, "lineas": [18]}, {"id": 2, "nombre": "Avenida. Pablo Iglesias", "lat": 36.8463132600496, "lng": -2.46473617050965, "lineas": [18]}, {"id": 3, "nombre": "Rambla Alfareros", "lat": 36.8431862152274, "lng": -2.46423861324673, "lineas": [18]}, {"id": 7, "nombre": "Stella Maris", "lat": 36.8370748907335, "lng": -2.46088098869098, "lineas": [1, 6, 7, 12, 18]}, {"id": 8, "nombre": "Avenida de la Estación", "lat": 36.8367816465867, "lng": -2.45707443839835, "lineas": [19, 20, 30, 31]}, {"id": 9, "nombre": "Ronda - Sanidad", "lat": 36.8390741560668, "lng": -2.45471238882752, "lineas": [2, 20, 30]}, {"id": 10, "nombre": "Ronda - Blas Infante", "lat": 36.8414259109113, "lng": -2.45339065792903, "lineas": [2, 20]}, {"id": 11, "nombre": "Cruz Roja", "lat": 36.8436824429405, "lng": -2.45243892073629, "lineas": [2, 20]}, {"id": 12, "nombre": "Bola Azul", "lat": 36.8482238455009, "lng": -2.45279565453527, "lineas": [2]}, {"id": 13, "nombre": "La Magnesita", "lat": 36.8508739899171, "lng": -2.45225830965522, "lineas": [2, 12, 18]}, {"id": 14, "nombre": "Fábrica de Azufre", "lat": 36.8544670980101, "lng": -2.4499927349562, "lineas": [18]}, {"id": 15, "nombre": "Acceso Piedras Redondas", "lat": 36.8567299212822, "lng": -2.44862311019967, "lineas": [18]}, {"id": 16, "nombre": "Rambla Iniesta", "lat": 36.8606210123938, "lng": -2.44764791979364, "lineas": [18]}, {"id": 17, "nombre": "Cementerio", "lat": 36.8621742380308, "lng": -2.44861927056548, "lineas": [18]}, {"id": 18, "nombre": "Ikea", "lat": 36.8520027829799, "lng": -2.46763032945892, "lineas": [18]}, {"id": 19, "nombre": "Carretera de Huércal 24", "lat": 36.8608601431599, "lng": -2.44520337105385, "lineas": [2, 3, 4]}, {"id": 20, "nombre": "Carretera de Huércal 56", "lat": 36.8622525880037, "lng": -2.44455885185599, "lineas": [2, 3, 4]}, {"id": 21, "nombre": "Materno Infantil", "lat": 36.861939243516, "lng": -2.44156410383002, "lineas": [2, 3, 4, 18]}, {"id": 22, "nombre": "Hospital Universitario Torrecárdenas", "lat": 36.8632881413344, "lng": -2.44081704361648, "lineas": [2, 3, 4, 18]}, {"id": 23, "nombre": "Estadio Municipal Juan Rojas", "lat": 36.8620873977698, "lng": -2.4447223957026, "lineas": [2, 3, 4, 18]}, {"id": 24, "nombre": "Asociación de Vecinos la Torre", "lat": 36.8603694806613, "lng": -2.44571815958773, "lineas": [18]}, {"id": 25, "nombre": "Acceso Piedras Redondas", "lat": 36.8565151094847, "lng": -2.44920577051833, "lineas": [18]}, {"id": 26, "nombre": "Fábrica de Azufre", "lat": 36.8535717898882, "lng": -2.45132053184363, "lineas": [18]}, {"id": 27, "nombre": "Ronda - la Magnesita", "lat": 36.8503627126888, "lng": -2.4526217493743, "lineas": [2, 11]}, {"id": 28, "nombre": "Ronda - Bola Azul", "lat": 36.8482406264626, "lng": -2.45293426819573, "lineas": [2, 11]}, {"id": 29, "nombre": "Ronda - Cruz Roja", "lat": 36.8436035525925, "lng": -2.45260320809113, "lineas": [2, 11, 20]}, {"id": 30, "nombre": "Ronda - Juzgados", "lat": 36.8407739162068, "lng": -2.45384683352773, "lineas": [2, 11, 20]}, {"id": 31, "nombre": "Sanidad", "lat": 36.8390706254456, "lng": -2.45492666684718, "lineas": [2, 5, 6, 8, 11, 20, 30]}, {"id": 32, "nombre": "Gregorio Marañón 45", "lat": 36.8376872602453, "lng": -2.45609893424973, "lineas": [2, 5, 6, 8, 11, 20, 30]}, {"id": 33, "nombre": "Gregorio Marañón - la Salle", "lat": 36.8390048257721, "lng": -2.45925043928774, "lineas": [19, 20, 30, 31]}, {"id": 37, "nombre": "Estadio de la Juventud", "lat": 36.8306139808315, "lng": -2.44979572987681, "lineas": [7]}, {"id": 39, "nombre": "Calle Fernández Bueso", "lat": 36.8333632958348, "lng": -2.45172430804514, "lineas": [7]}, {"id": 40, "nombre": "Calle América", "lat": 36.8331769878009, "lng": -2.45435727703822, "lineas": [7]}, {"id": 41, "nombre": "Cabo de Gata - Villa García", "lat": 36.8302314266658, "lng": -2.45284637588244, "lineas": [12, 18]}, {"id": 42, "nombre": "Cabo de Gata - San Miguel", "lat": 36.8313722418277, "lng": -2.45589967183402, "lineas": [7, 12, 18]}, {"id": 43, "nombre": "Cabo de Gata - Club Náutico", "lat": 36.8327591187718, "lng": -2.4595568879835, "lineas": [7, 12, 18]}, {"id": 44, "nombre": "Oliveros", "lat": 36.8347901757282, "lng": -2.46235140430975, "lineas": [6, 7, 12, 18]}, {"id": 47, "nombre": "Club Náutico", "lat": 36.8325426728698, "lng": -2.45953373916212, "lineas": [7, 11, 18]}, {"id": 48, "nombre": "San Miguel", "lat": 36.8312913647595, "lng": -2.45595519371843, "lineas": [7, 11, 18]}, {"id": 49, "nombre": "Villa García", "lat": 36.8301706500447, "lng": -2.45325179534169, "lineas": [7, 11, 18]}, {"id": 50, "nombre": "La Salle", "lat": 36.839445886755, "lng": -2.45912627775005, "lineas": [5, 6, 8]}, {"id": 51, "nombre": "Obelisco", "lat": 36.8421427009888, "lng": -2.45747654635567, "lineas": [5, 6, 7, 8, 12, 18]}, {"id": 52, "nombre": "Plaza Altamira", "lat": 36.8420156364136, "lng": -2.45636805579609, "lineas": [5, 6, 8]}, {"id": 53, "nombre": "Doctor Carracido", "lat": 36.8411449890793, "lng": -2.45432243824252, "lineas": [5, 6, 8]}, {"id": 54, "nombre": "Blas Infante", "lat": 36.8412843385186, "lng": -2.45115150224462, "lineas": [5, 6, 8, 30]}, {"id": 55, "nombre": "Arcipreste de Hita", "lat": 36.8410029660082, "lng": -2.44850467469051, "lineas": [5, 6, 8, 30]}, {"id": 56, "nombre": "Parque Carrefour", "lat": 36.8413257801222, "lng": -2.44723130300844, "lineas": [5, 6, 8, 30]}, {"id": 57, "nombre": "Parque del Generalife", "lat": 36.8430413934753, "lng": -2.44709568761043, "lineas": [5, 6, 8, 30]}, {"id": 58, "nombre": "Avenida Mediterráneo 298", "lat": 36.8447901406457, "lng": -2.44708534002415, "lineas": [3, 4, 5, 6, 8, 11]}, {"id": 59, "nombre": "Avenida Mediterráneo - Carretera de Níjar", "lat": 36.8464814969582, "lng": -2.44709120013337, "lineas": [4, 5, 11]}, {"id": 60, "nombre": "Avenida Mediterráneo - San Luis", "lat": 36.8490255959983, "lng": -2.44663772201705, "lineas": [4, 5, 11]}, {"id": 61, "nombre": "Avenida Mediterráneo - Centro Comercial", "lat": 36.8538708826638, "lng": -2.44603335860117, "lineas": [2, 4, 5]}, {"id": 65, "nombre": "Villa Blanca - Parque", "lat": 36.8532881348582, "lng": -2.44150758238419, "lineas": [5, 8]}, {"id": 66, "nombre": "Costa de Almería 33", "lat": 36.8542868304406, "lng": -2.44333080740654, "lineas": [5, 8]}, {"id": 67, "nombre": "Centro Comercial Mediterráneo", "lat": 36.8527284428635, "lng": -2.44635290542431, "lineas": [2, 4, 5, 8]}, {"id": 68, "nombre": "Barrio San Luis", "lat": 36.848554037874, "lng": -2.44675438058621, "lineas": [4, 5, 8, 12]}, {"id": 69, "nombre": "Jefatura Policía Local", "lat": 36.8449943710247, "lng": -2.44739911616327, "lineas": [4, 5, 6, 8, 12]}, {"id": 70, "nombre": "Avenida Mediterráneo 233", "lat": 36.8429950676618, "lng": -2.44740077670821, "lineas": [5, 6, 8, 12, 30]}, {"id": 71, "nombre": "Plaza Nueva Andalucía", "lat": 36.8412969370055, "lng": -2.44752432558995, "lineas": [4, 5, 6, 8, 12, 30]}, {"id": 72, "nombre": "IES Azcona", "lat": 36.8396469009647, "lng": -2.44862415003422, "lineas": [5, 6, 8, 30]}, {"id": 74, "nombre": "Conservatorio de Música", "lat": 36.8396730706778, "lng": -2.45194701195937, "lineas": [5, 6, 8, 30]}, {"id": 75, "nombre": "Plaza de Pescadores", "lat": 36.8392532246677, "lng": -2.47836444940422, "lineas": [6]}, {"id": 76, "nombre": "Calle Valdivia", "lat": 36.8409346173346, "lng": -2.4770185659875, "lineas": [6]}, {"id": 77, "nombre": "Avenida. del Mar, 106", "lat": 36.8410150980773, "lng": -2.47581708454548, "lineas": [6]}, {"id": 78, "nombre": "Avenida. del Mar, 50", "lat": 36.8392852791664, "lng": -2.47559011532809, "lineas": [6]}, {"id": 79, "nombre": "Avenida del Mar 39", "lat": 36.8376687821531, "lng": -2.47610639353548, "lineas": [1, 6]}, {"id": 80, "nombre": "Rambla 54", "lat": 36.8387628204751, "lng": -2.45957295543877, "lineas": [7, 12, 18]}, {"id": 81, "nombre": "Granja Escuela", "lat": 36.8454640185589, "lng": -2.44661166317226, "lineas": [3, 6, 8, 20]}, {"id": 82, "nombre": "Los Díaz", "lat": 36.8460957348022, "lng": -2.44200328996504, "lineas": [3, 6, 8, 20]}, {"id": 83, "nombre": "Plaza Fátima", "lat": 36.8451019736479, "lng": -2.43906314836346, "lineas": [6, 20]}, {"id": 84, "nombre": "Polígono la Mezquita", "lat": 36.8431525459241, "lng": -2.43444937636499, "lineas": [6, 20]}, {"id": 94, "nombre": "Terrazas Almadrabillas", "lat": 36.8318483834862, "lng": -2.45751560610313, "lineas": [7, 11, 18]}, {"id": 96, "nombre": "El Ingenio", "lat": 36.8435960330669, "lng": -2.43552285912054, "lineas": [6, 20]}, {"id": 97, "nombre": "Molino Rojo", "lat": 36.8459369310531, "lng": -2.43980232034156, "lineas": [6, 20]}, {"id": 98, "nombre": "Carretera de Níjar - los Díaz", "lat": 36.846144356412, "lng": -2.44200911277036, "lineas": [6, 20]}, {"id": 99, "nombre": "Carretera de Níjar - Granja Escuela", "lat": 36.8456369836953, "lng": -2.44504017173126, "lineas": [6, 20]}, {"id": 101, "nombre": "Fuente de los Peces", "lat": 36.8359091971677, "lng": -2.46789844114503, "lineas": [6]}, {"id": 102, "nombre": "La Curva, Nicolás Salmerón", "lat": 36.8375782719294, "lng": -2.47329479133752, "lineas": [6]}, {"id": 104, "nombre": "San Roque", "lat": 36.8374201483085, "lng": -2.47854267247255, "lineas": [6]}, {"id": 107, "nombre": "Iglesia Piedras Redondas", "lat": 36.8585024083723, "lng": -2.45132710374349, "lineas": [7]}, {"id": 108, "nombre": "Residencia Alborán", "lat": 36.8319932219813, "lng": -2.45765027532841, "lineas": [7, 12, 18]}, {"id": 109, "nombre": "Sierra de Gredos", "lat": 36.8543117773776, "lng": -2.45597532108119, "lineas": [7]}, {"id": 111, "nombre": "Maestría", "lat": 36.8494984599631, "lng": -2.455499800026, "lineas": [7, 18]}, {"id": 112, "nombre": "Carretera de Granada 213", "lat": 36.848163570975, "lng": -2.45693903041545, "lineas": [7, 18]}, {"id": 113, "nombre": "Carretera de Granada 145", "lat": 36.8466994566253, "lng": -2.45845493559009, "lineas": [7, 18]}, {"id": 114, "nombre": "Rambla - Vaguada", "lat": 36.8446683314379, "lng": -2.45854257162743, "lineas": [7, 18]}, {"id": 115, "nombre": "Rambla - Obelisco", "lat": 36.8422182469356, "lng": -2.4582285751189, "lineas": [7]}, {"id": 116, "nombre": "Mamí - Cauce", "lat": 36.8464100859436, "lng": -2.44073654040916, "lineas": [3, 8]}, {"id": 117, "nombre": "Vaguada", "lat": 36.8447589691691, "lng": -2.45793137048162, "lineas": [7, 18]}, {"id": 126, "nombre": "Mamí - Iglesia", "lat": 36.8468352818056, "lng": -2.43906501179629, "lineas": [3, 8]}, {"id": 127, "nombre": "Mamí 140", "lat": 36.8475258502508, "lng": -2.43649088834106, "lineas": [8]}, {"id": 128, "nombre": "Araceli - Parque", "lat": 36.8561783177183, "lng": -2.45289863679597, "lineas": [7]}, {"id": 130, "nombre": "Cruz de Caravaca", "lat": 36.850511996612, "lng": -2.45439000072707, "lineas": [18]}, {"id": 131, "nombre": "Araceli", "lat": 36.8558328323745, "lng": -2.45336744047726, "lineas": [7]}, {"id": 133, "nombre": "California", "lat": 36.8287820553569, "lng": -2.45131483048887, "lineas": [11, 18]}, {"id": 134, "nombre": "Cabo de Gata - Zapillo", "lat": 36.8264192047755, "lng": -2.44913615392177, "lineas": [11, 18]}, {"id": 135, "nombre": "Paseo Marítimo - el Palmeral", "lat": 36.8249946035049, "lng": -2.44712577289457, "lineas": [11, 18]}, {"id": 136, "nombre": "Paseo Marítimo - Auditorio", "lat": 36.8228840838463, "lng": -2.44439605024874, "lineas": [3, 11, 12, 18]}, {"id": 137, "nombre": "Paseo Marítimo - Residencia de Mayores", "lat": 36.8197003390613, "lng": -2.43984405140858, "lineas": [3, 4, 11, 12, 18]}, {"id": 138, "nombre": "Paseo Marítimo - Nueva Almería", "lat": 36.8176444767573, "lng": -2.43681094233269, "lineas": [11, 12, 18]}, {"id": 140, "nombre": "Paseo Marítimo - Río Andarax", "lat": 36.8156840147262, "lng": -2.42647580165824, "lineas": [11, 12, 18]}, {"id": 141, "nombre": "Paseo Marítimo - la Cabaña", "lat": 36.8173528594264, "lng": -2.41962487037979, "lineas": [11, 12, 18]}, {"id": 142, "nombre": "Paseo Marítimo - el Bobar", "lat": 36.8186289305918, "lng": -2.41444190753946, "lineas": [11, 12, 18]}, {"id": 143, "nombre": "Paseo Marítimo - Trafariña", "lat": 36.8216149492713, "lng": -2.40977869710316, "lineas": [11, 12, 18]}, {"id": 144, "nombre": "Universidad", "lat": 36.8278525195026, "lng": -2.40402217600542, "lineas": [11, 12, 15, 18]}, {"id": 145, "nombre": "Trafariña", "lat": 36.8216510454095, "lng": -2.40990527898508, "lineas": [11, 12, 18]}, {"id": 147, "nombre": "La Cabaña", "lat": 36.8174182722689, "lng": -2.41976150149979, "lineas": [11, 12, 18]}, {"id": 149, "nombre": "Playa", "lat": 36.8169246972906, "lng": -2.43582944781038, "lineas": [11, 12, 18]}, {"id": 150, "nombre": "Nueva Almería", "lat": 36.8185937858309, "lng": -2.43819726683279, "lineas": [3, 4, 11, 12, 18]}, {"id": 151, "nombre": "Quinto Pino", "lat": 36.8205254203822, "lng": -2.44089528731058, "lineas": [3, 4, 11, 12, 18]}, {"id": 152, "nombre": "Auditorio", "lat": 36.822902378394, "lng": -2.44413502861695, "lineas": [3, 11, 12, 18]}, {"id": 154, "nombre": "Avenida Mediterráneo - Auditorio", "lat": 36.8253982534149, "lng": -2.44507420296347, "lineas": [3, 11]}, {"id": 155, "nombre": "Parque de las Familias", "lat": 36.8301315380702, "lng": -2.44585863127398, "lineas": [3, 11]}, {"id": 156, "nombre": "Zeus", "lat": 36.8499330487834, "lng": -2.43537196027219, "lineas": [3, 8]}, {"id": 157, "nombre": "Avenida Mediterráneo 104", "lat": 36.8324676557175, "lng": -2.44631017427795, "lineas": [7]}, {"id": 158, "nombre": "Avenida Mediterráneo - Cortijo Grande", "lat": 36.8342605598715, "lng": -2.44670805511794, "lineas": [7]}, {"id": 161, "nombre": "La Fuente", "lat": 36.850594158999, "lng": -2.43714151707135, "lineas": [3, 8]}, {"id": 162, "nombre": "Avenida Mediterráneo 45", "lat": 36.8301362341963, "lng": -2.44591693221421, "lineas": [3, 12]}, {"id": 163, "nombre": "Avenida Mediterráneo 23", "lat": 36.8254236812377, "lng": -2.44515446350979, "lineas": [3, 12]}, {"id": 164, "nombre": "Cabo de Gata - el Palmeral", "lat": 36.8250845376985, "lng": -2.44708027308314, "lineas": [12, 18]}, {"id": 165, "nombre": "Plaza del Zapillo", "lat": 36.8262068600945, "lng": -2.44889572412968, "lineas": [12, 18]}, {"id": 166, "nombre": "Cabo de Gata - California", "lat": 36.829287901186, "lng": -2.45153997998736, "lineas": [12, 18]}, {"id": 167, "nombre": "El Charco", "lat": 36.8349206686415, "lng": -2.38895022529645, "lineas": [15, 18]}, {"id": 168, "nombre": "Costacabana - Pistas Deportivas", "lat": 36.8385179635717, "lng": -2.38506557623064, "lineas": [15, 18]}, {"id": 169, "nombre": "Plaza de Costacabana", "lat": 36.8394696524665, "lng": -2.38085341219729, "lineas": [15, 18]}, {"id": 171, "nombre": "Rhin", "lat": 36.8366084553108, "lng": -2.38534150676159, "lineas": [15, 18]}, {"id": 172, "nombre": "Volga", "lat": 36.835329905442, "lng": -2.3881988862301, "lineas": [15, 18]}, {"id": 174, "nombre": "Regiones", "lat": 36.8454311464511, "lng": -2.45118804021165, "lineas": [20]}, {"id": 175, "nombre": "Los Partidores", "lat": 36.8409152145513, "lng": -2.42456140061547, "lineas": [20]}, {"id": 176, "nombre": "Los Picos", "lat": 36.8395550281366, "lng": -2.41840286040882, "lineas": [20]}, {"id": 177, "nombre": "La Cañada 50", "lat": 36.8407310635468, "lng": -2.4129652057059, "lineas": [15, 20]}, {"id": 179, "nombre": "Plaza de la Cañada", "lat": 36.8404685602186, "lng": -2.40733855892451, "lineas": [15, 20]}, {"id": 180, "nombre": "Carretera de Níjar 280", "lat": 36.8406073662845, "lng": -2.40021227020194, "lineas": [15, 20]}, {"id": 181, "nombre": "Kilómetro 5 - la Cañada", "lat": 36.840472688697, "lng": -2.40426504550492, "lineas": [15, 20]}, {"id": 183, "nombre": "IES Portocarrero", "lat": 36.8458897013221, "lng": -2.38816386218282, "lineas": [15, 20]}, {"id": 188, "nombre": "Aeropuerto", "lat": 36.8483048509683, "lng": -2.37125859728964, "lineas": [30]}, {"id": 189, "nombre": "Kilómetro 8", "lat": 36.850979783244, "lng": -2.36878573292528, "lineas": [30]}, {"id": 190, "nombre": "La Venta", "lat": 36.8519187971892, "lng": -2.36327684063398, "lineas": [30]}, {"id": 191, "nombre": "El Chalet", "lat": 36.8523541369538, "lng": -2.36077124818383, "lineas": [30]}, {"id": 192, "nombre": "Kilómetro 9 - Retamar", "lat": 36.852831330807, "lng": -2.35751287594056, "lineas": [15, 20, 30]}, {"id": 193, "nombre": "El Alquián - Retamar", "lat": 36.8529066977849, "lng": -2.35489169115568, "lineas": [15, 20, 30]}, {"id": 194, "nombre": "IES el Alquián", "lat": 36.851984438441, "lng": -2.35096031087856, "lineas": [15, 20, 30]}, {"id": 195, "nombre": "El Alquián - Almería", "lat": 36.853012781809, "lng": -2.35474873484717, "lineas": [15, 20, 30]}, {"id": 196, "nombre": "Kilómetro 9 - Almería", "lat": 36.8529131607693, "lng": -2.35764231069947, "lineas": [15, 20, 30]}, {"id": 197, "nombre": "El Chalet", "lat": 36.8524262758904, "lng": -2.3609666237181, "lineas": [30]}, {"id": 198, "nombre": "La Venta", "lat": 36.8519977738311, "lng": -2.3632686145228, "lineas": [30]}, {"id": 199, "nombre": "Kilómetro 8", "lat": 36.8510178004719, "lng": -2.3689860166236, "lineas": [30]}, {"id": 204, "nombre": "Los Ángeles", "lat": 36.8459543527809, "lng": -2.38846506308556, "lineas": [15, 20]}, {"id": 205, "nombre": "Agua Fresca", "lat": 36.8425774679834, "lng": -2.39620714606336, "lineas": [15, 20]}, {"id": 206, "nombre": "Kilómetro 5", "lat": 36.8406441282822, "lng": -2.40058323206041, "lineas": [15, 20]}, {"id": 207, "nombre": "Carretera de Níjar 239", "lat": 36.8403720250825, "lng": -2.40517896858266, "lineas": [15, 20]}, {"id": 208, "nombre": "Plaza de la Cañada - Iglesia", "lat": 36.8405331068792, "lng": -2.4080639728284, "lineas": [15, 20]}, {"id": 210, "nombre": "La Cañada 51", "lat": 36.8407232843753, "lng": -2.41341662430297, "lineas": [15, 20]}, {"id": 211, "nombre": "Los Picos - Casi", "lat": 36.8397451901454, "lng": -2.41971810875801, "lineas": [20]}, {"id": 212, "nombre": "Los Partidores - Casi", "lat": 36.8418008013847, "lng": -2.42566850263051, "lineas": [20]}, {"id": 214, "nombre": "Paseo de Castañeda, 94", "lat": 36.8510134542415, "lng": -2.30644068752975, "lineas": [31]}, {"id": 215, "nombre": "Paseo de Castañeda, Calle Pomelo", "lat": 36.8474471129588, "lng": -2.30560904774532, "lineas": [31]}, {"id": 216, "nombre": "Camino de la Escuela, 111", "lat": 36.845029962844, "lng": -2.30397851115615, "lineas": [31]}, {"id": 221, "nombre": "Residencial los Girasoles", "lat": 36.8349229364287, "lng": -2.31188949519888, "lineas": [15, 30]}, {"id": 222, "nombre": "Guardería", "lat": 36.8393151560587, "lng": -2.30557012554234, "lineas": [15, 30]}, {"id": 223, "nombre": "Camino de la Escuela 20", "lat": 36.845236082937, "lng": -2.30377138913974, "lineas": [15, 30]}, {"id": 224, "nombre": "Paseo de Castañeda 122", "lat": 36.8479655456758, "lng": -2.30574212101414, "lineas": [15, 30]}, {"id": 225, "nombre": "Paseo de Castañeda 92", "lat": 36.8510081134432, "lng": -2.30634816666975, "lineas": [15, 30]}, {"id": 226, "nombre": "Calle Real Solar", "lat": 36.8907379873153, "lng": -2.28186710471453, "lineas": [20]}, {"id": 227, "nombre": "Cuevas Centro", "lat": 36.8922008331339, "lng": -2.28079723897871, "lineas": [20]}, {"id": 228, "nombre": "Camino de los Molinos, 40", "lat": 36.8934385455459, "lng": -2.28004955690208, "lineas": [20]}, {"id": 229, "nombre": "Camino de las Heras", "lat": 36.8923394346068, "lng": -2.27862119559392, "lineas": [20]}, {"id": 230, "nombre": "Camino de los Molinos, 15", "lat": 36.8934752877976, "lng": -2.28016256502249, "lineas": [20]}, {"id": 231, "nombre": "Calle Real", "lat": 36.8922057453928, "lng": -2.28088699163447, "lineas": [20]}, {"id": 232, "nombre": "Calle Real, 1", "lat": 36.8906725840402, "lng": -2.28200857548957, "lineas": [20]}, {"id": 238, "nombre": "Colegio San Bernardo", "lat": 36.8545612993591, "lng": -2.35879983715515, "lineas": [15, 20]}, {"id": 239, "nombre": "Paraje del Cerrillo", "lat": 36.8546638638358, "lng": -2.35889732541904, "lineas": [15, 20]}, {"id": 240, "nombre": "Carretera Viator - el Alquián 7", "lat": 36.8557647583362, "lng": -2.36323616813636, "lineas": [15, 20]}, {"id": 242, "nombre": "Carretera Viator - el Alquián 11", "lat": 36.8557404716664, "lng": -2.36402689510628, "lineas": [15, 20]}, {"id": 244, "nombre": "San Vicente 32", "lat": 36.8591034870293, "lng": -2.37064711385862, "lineas": [15, 20]}, {"id": 245, "nombre": "San Vicente 126", "lat": 36.8591483080521, "lng": -2.37059963019565, "lineas": [15, 20]}, {"id": 246, "nombre": "Carretera Viator - el Alquián 153", "lat": 36.8616992006701, "lng": -2.3756931575888, "lineas": [15, 20]}, {"id": 247, "nombre": "Carretera Viator - el Alquián 142", "lat": 36.8616971957838, "lng": -2.37553606861711, "lineas": [15, 20]}, {"id": 248, "nombre": "López Campillo - el Alquián", "lat": 36.8652470539113, "lng": -2.37840618887693, "lineas": [15, 20]}, {"id": 249, "nombre": "López Campillo - la Cañada", "lat": 36.8653101584978, "lng": -2.37840679959151, "lineas": [15, 20]}, {"id": 252, "nombre": "Venta Gaspar - Parque", "lat": 36.8677376979703, "lng": -2.38623585611563, "lineas": [15, 20]}, {"id": 253, "nombre": "Venta Gaspar - la Cañada", "lat": 36.8677652731329, "lng": -2.38631335326411, "lineas": [15, 20]}, {"id": 254, "nombre": "Boticario - el Álamo", "lat": 36.8604175420008, "lng": -2.38785885320683, "lineas": [15, 20]}, {"id": 255, "nombre": "Boticario - Parque", "lat": 36.8603999921245, "lng": -2.38796593306702, "lineas": [15, 20]}, {"id": 257, "nombre": "Cruce de los Llanos", "lat": 36.8564657723485, "lng": -2.38760132398533, "lineas": [15, 20]}, {"id": 258, "nombre": "Carretera de Viator 56", "lat": 36.8537045795295, "lng": -2.38701264307107, "lineas": [15, 20]}, {"id": 259, "nombre": "Carretera de Viator 47", "lat": 36.853699199973, "lng": -2.38708932455569, "lineas": [15, 20]}, {"id": 264, "nombre": "Los Castaños", "lat": 36.8626165187896, "lng": -2.30853526636858, "lineas": [20]}, {"id": 265, "nombre": "Los Castaños", "lat": 36.862626531161, "lng": -2.30870682066934, "lineas": [20]}, {"id": 266, "nombre": "Acebuche", "lat": 36.8633732641486, "lng": -2.30474820791648, "lineas": [20]}, {"id": 267, "nombre": "Regiones - Moisés Ruiz", "lat": 36.8455830939072, "lng": -2.45090654948752, "lineas": [20]}, {"id": 268, "nombre": "Carretera de Níjar 191", "lat": 36.8520850861714, "lng": -2.35108997220101, "lineas": [15, 20, 30]}, {"id": 273, "nombre": "Carretera de Ronda 31", "lat": 36.8344137420466, "lng": -2.45826959611689, "lineas": [1, 19, 31]}, {"id": 274, "nombre": "Calles Darrical, Oviedo", "lat": 36.8333040993459, "lng": -2.44867297877969, "lineas": [7]}, {"id": 275, "nombre": "Calles Darrical, Vélez Rubio", "lat": 36.8334219236852, "lng": -2.44686887804846, "lineas": [7]}, {"id": 277, "nombre": "Calles Darrícal, Laroles", "lat": 36.8334828663457, "lng": -2.446938539241, "lineas": [7]}, {"id": 278, "nombre": "Calles Darrícal, Fiñana", "lat": 36.8334653054684, "lng": -2.44844529060324, "lineas": [7]}, {"id": 281, "nombre": "Rambla - Humilladero", "lat": 36.8467570774314, "lng": -2.45969305987706, "lineas": [18]}, {"id": 282, "nombre": "Mercado de los Ángeles", "lat": 36.8476972480548, "lng": -2.45981965435404, "lineas": [7, 18]}, {"id": 286, "nombre": "Villa María", "lat": 36.8543543268616, "lng": -2.45585901416326, "lineas": [7]}, {"id": 287, "nombre": "Camino de la Cruz-consultorio", "lat": 36.8516272019913, "lng": -2.45560732103716, "lineas": [7]}, {"id": 291, "nombre": "Avenida Mediterráneo - Plaza San Luis", "lat": 36.8469606682414, "lng": -2.44710068583987, "lineas": [4, 5, 8, 12]}, {"id": 292, "nombre": "Estación Intermodal", "lat": 36.835051468164, "lng": -2.4561898555244, "lineas": [1, 2, 19, 30, 31]}, {"id": 293, "nombre": "Artés de Arcos", "lat": 36.8359799377494, "lng": -2.45896058937732, "lineas": [1, 19, 31]}, {"id": 294, "nombre": "Las Palomas - Playa", "lat": 36.8296002313111, "lng": -2.39770826544561, "lineas": [15, 18]}, {"id": 298, "nombre": "Paseo de la Caridad", "lat": 36.8478782841454, "lng": -2.46527680200894, "lineas": [18]}, {"id": 299, "nombre": "Villa Blanca - Panificadora", "lat": 36.8534069262895, "lng": -2.43985019202745, "lineas": [5, 8]}, {"id": 302, "nombre": "Juegos de Atenas", "lat": 36.8417458100385, "lng": -2.3070156342483, "lineas": [31]}, {"id": 303, "nombre": "Juegos de Barcelona - Túnez", "lat": 36.8408085450388, "lng": -2.3132710739239, "lineas": [31]}, {"id": 304, "nombre": "Juegos de Barcelona - Atenas", "lat": 36.8387403707774, "lng": -2.31104654416686, "lineas": [31]}, {"id": 306, "nombre": "Colegio Europa", "lat": 36.8590130195825, "lng": -2.44349215426348, "lineas": [3]}, {"id": 307, "nombre": "Domingo Artés 20", "lat": 36.8599970104673, "lng": -2.44474763820008, "lineas": [2, 3, 4]}, {"id": 308, "nombre": "Madre María Aznar 127", "lat": 36.8558522984882, "lng": -2.44089485355081, "lineas": [3, 5, 8]}, {"id": 309, "nombre": "Madre María Aznar 142", "lat": 36.8562446799166, "lng": -2.44132664508271, "lineas": [3, 8]}, {"id": 311, "nombre": "Avenida. Madre María Aznar, 151", "lat": 36.85888777445, "lng": -2.44348441244463, "lineas": [3]}, {"id": 312, "nombre": "Instituto Alhadra", "lat": 36.8483353406778, "lng": -2.44183967843727, "lineas": [3]}, {"id": 313, "nombre": "Cabo de Gata 140", "lat": 36.8276960217144, "lng": -2.45038514159945, "lineas": [11, 18]}, {"id": 314, "nombre": "Cabo de Gata 131", "lat": 36.8277765540486, "lng": -2.45025560928381, "lineas": [12, 18]}, {"id": 316, "nombre": "Camino de los Espejos", "lat": 36.8421541411431, "lng": -2.30393616056805, "lineas": [15, 30]}, {"id": 317, "nombre": "Residencial Sol", "lat": 36.8370909987033, "lng": -2.30873692366825, "lineas": [15, 30]}, {"id": 318, "nombre": "Las Palomas", "lat": 36.8296595950541, "lng": -2.39774430297928, "lineas": [15, 18]}, {"id": 319, "nombre": "Tanatorio", "lat": 36.8642924856189, "lng": -2.44763706813046, "lineas": [18]}, {"id": 320, "nombre": "Redonda Estadio Municipal", "lat": 36.8629589397819, "lng": -2.44503987798566, "lineas": [18]}, {"id": 321, "nombre": "Madre María Aznar 6", "lat": 36.8520054503621, "lng": -2.43915828021068, "lineas": [3, 5, 8]}, {"id": 324, "nombre": "Instituto Albaida", "lat": 36.8471696468356, "lng": -2.44315709686347, "lineas": [3]}, {"id": 325, "nombre": "Manuel Mendizábal", "lat": 36.8540435337247, "lng": -2.44565793403134, "lineas": [5, 8]}, {"id": 326, "nombre": "Barranco las Heras, 14", "lat": 36.893843076027, "lng": -2.27838381377832, "lineas": [20]}, {"id": 327, "nombre": "Barranco las Heras", "lat": 36.8939831735232, "lng": -2.27818941575591, "lineas": [20]}, {"id": 328, "nombre": "Plaza San Sebastián", "lat": 36.8419379419191, "lng": -2.46300816020276, "lineas": [18]}, {"id": 329, "nombre": "Santos Zárate", "lat": 36.8415991436365, "lng": -2.45909258724621, "lineas": [18]}, {"id": 332, "nombre": "Hospital de el Toyo", "lat": 36.8509466222962, "lng": -2.31392902640429, "lineas": [20]}, {"id": 333, "nombre": "Hospital el Toyo", "lat": 36.8509928745692, "lng": -2.31402585609562, "lineas": [15, 30]}, {"id": 336, "nombre": "Paseo de la Caridad, 5", "lat": 36.8465088036823, "lng": -2.46684826911705, "lineas": [18]}, {"id": 337, "nombre": "Calle Largo Caballero, 40", "lat": 36.8473410115567, "lng": -2.46825390037976, "lineas": [18]}, {"id": 338, "nombre": "Calle Largo Caballero, 84", "lat": 36.8489072111022, "lng": -2.47028514637756, "lineas": [18]}, {"id": 339, "nombre": "Residencia Ballesol", "lat": 36.851724930101, "lng": -2.46943340790514, "lineas": [18]}, {"id": 340, "nombre": "CEP", "lat": 36.851242203602, "lng": -2.46631060361517, "lineas": [18]}, {"id": 341, "nombre": "IES Al Andalus", "lat": 36.8503218321187, "lng": -2.46482642094493, "lineas": [18]}, {"id": 342, "nombre": "Delegación de Educación", "lat": 36.8490613972209, "lng": -2.46246165230196, "lineas": [7, 18]}, {"id": 343, "nombre": "CEP", "lat": 36.8507114673229, "lng": -2.46455549804182, "lineas": [18]}, {"id": 344, "nombre": "Residencia Ballesol", "lat": 36.8518331914274, "lng": -2.46945285052502, "lineas": [18]}, {"id": 345, "nombre": "Calle Fernando de Rojas, Colegio", "lat": 36.8486299068042, "lng": -2.47076713195234, "lineas": [18]}, {"id": 346, "nombre": "Calle Genoveses, 29", "lat": 36.8472716539032, "lng": -2.46940136851079, "lineas": [18]}, {"id": 347, "nombre": "Rambla Belén, Alfarerías", "lat": 36.8483827841906, "lng": -2.46190221917294, "lineas": [18]}, {"id": 349, "nombre": "Loma Cabrera", "lat": 36.8567145705828, "lng": -2.38207901816281, "lineas": [20]}, {"id": 350, "nombre": "Juegos de Casablanca - Hoteles", "lat": 36.8352054712994, "lng": -2.31660977966486, "lineas": [15, 30]}, {"id": 351, "nombre": "Centro de Congresos - Hoteles", "lat": 36.8381526415217, "lng": -2.32281791389517, "lineas": [15, 30]}, {"id": 352, "nombre": "Juegos del Mediterráneo 11", "lat": 36.8440057366616, "lng": -2.32058888579341, "lineas": [15, 30]}, {"id": 355, "nombre": "Residencial Sol", "lat": 36.8372156743676, "lng": -2.30890311725267, "lineas": [31]}, {"id": 356, "nombre": "Los Girasoles", "lat": 36.8349995734049, "lng": -2.31207685437407, "lineas": [31]}, {"id": 367, "nombre": "Árbol de la Seda", "lat": 36.8370594723942, "lng": -2.43442667396016, "lineas": [7]}, {"id": 377, "nombre": "Residencial Alborán", "lat": 36.8342825961005, "lng": -2.31463667593614, "lineas": [15, 30]}, {"id": 378, "nombre": "Residencial Alborán, Parque", "lat": 36.8345334395753, "lng": -2.31463764271379, "lineas": [31]}, {"id": 384, "nombre": "Manuel Azaña", "lat": 36.8431422124409, "lng": -2.44358893785352, "lineas": [30]}, {"id": 385, "nombre": "Estadio Mediterráneo", "lat": 36.8412198762038, "lng": -2.4335650854701, "lineas": [19, 30, 31]}, {"id": 388, "nombre": "Estadio Mediterráneo - Centro", "lat": 36.841464649326, "lng": -2.43385487404045, "lineas": [3, 4, 11, 19, 30, 31]}, {"id": 389, "nombre": "Calle Manuel Azaña, 139", "lat": 36.8432787380581, "lng": -2.44386834493533, "lineas": [3, 4, 11, 30]}, {"id": 391, "nombre": "Italia 6", "lat": 36.8513510675501, "lng": -2.44989484552659, "lineas": [2, 12]}, {"id": 392, "nombre": "Italia - Parque", "lat": 36.8514825340564, "lng": -2.44982230573079, "lineas": [2, 11]}, {"id": 393, "nombre": "Italia - Tito Pedro", "lat": 36.8515885897355, "lng": -2.44784295558927, "lineas": [2, 12]}, {"id": 394, "nombre": "Italia 11", "lat": 36.8516761712355, "lng": -2.44791388433019, "lineas": [2, 11]}, {"id": 395, "nombre": "Avenida. Madre María Aznar - la Salle Chocillas", "lat": 36.8520068392809, "lng": -2.43923816074977, "lineas": [3, 5]}, {"id": 396, "nombre": "Avenida Mediterráneo - Hotel Elba", "lat": 36.8553334962634, "lng": -2.44584739208219, "lineas": [2, 4, 5]}, {"id": 397, "nombre": "Fray Juan de Portocarrero - Costa de la Luz", "lat": 36.856873448641, "lng": -2.44438932905038, "lineas": [5]}, {"id": 398, "nombre": "Parroquia de San José", "lat": 36.8450411284164, "lng": -2.45655206227761, "lineas": [12, 18]}, {"id": 399, "nombre": "Santa Isabel 58", "lat": 36.8478432588455, "lng": -2.4542878265089, "lineas": [12, 18]}, {"id": 400, "nombre": "Calle Canónigo Molina Alonso", "lat": 36.8348696844866, "lng": -2.46206658590388, "lineas": [2]}, {"id": 401, "nombre": "Carretera de Ronda 78", "lat": 36.8372549889832, "lng": -2.4558369998712, "lineas": [2, 20, 30]}, {"id": 402, "nombre": "Parroquia Jesucristo Redentor", "lat": 36.8575374171847, "lng": -2.44534002722683, "lineas": [2, 4]}, {"id": 403, "nombre": "Colegio Almería Norte", "lat": 36.8568998086876, "lng": -2.44589826721508, "lineas": [2, 4]}, {"id": 406, "nombre": "Puerta del Mar", "lat": 36.8356832796657, "lng": -2.46682205115682, "lineas": [1]}, {"id": 407, "nombre": "Paseo San Luis, 7", "lat": 36.8368490503132, "lng": -2.46887359900286, "lineas": [1]}, {"id": 408, "nombre": "Calle la Reina, 17", "lat": 36.8391762680193, "lng": -2.46879179549456, "lineas": [1]}, {"id": 409, "nombre": "Alcazaba", "lat": 36.8399649135547, "lng": -2.47029299257451, "lineas": [1]}, {"id": 410, "nombre": "Calle Reducto, 8", "lat": 36.8399376688763, "lng": -2.47280961119265, "lineas": [1]}, {"id": 411, "nombre": "Calle Reducto, 92", "lat": 36.84044906737, "lng": -2.47482107013011, "lineas": [1]}, {"id": 412, "nombre": "La Curva", "lat": 36.8377825432525, "lng": -2.47295949900957, "lineas": [1]}, {"id": 413, "nombre": "Calle Nicolás Salmerón, 40", "lat": 36.8369382932738, "lng": -2.47021826028652, "lineas": [1]}, {"id": 414, "nombre": "Calle Nicolás Salmerón, 20", "lat": 36.8359916714327, "lng": -2.46713422437748, "lineas": [1]}, {"id": 415, "nombre": "Calle Nicolás Salmerón, 8", "lat": 36.8347374461737, "lng": -2.46445938922943, "lineas": [1]}, {"id": 417, "nombre": "Alcalde Santiago Martínez Cabrejas", "lat": 36.8372734856425, "lng": -2.43776946518472, "lineas": [3, 4, 7, 11]}, {"id": 419, "nombre": "Rambla 47- Concordia", "lat": 36.8387211928937, "lng": -2.46033139538193, "lineas": [7]}, {"id": 420, "nombre": "Federico García Lorca, 9", "lat": 36.836070062064, "lng": -2.46212530278519, "lineas": [1, 2, 6, 7, 11, 18]}, {"id": 421, "nombre": "Avenida. de la Cruz, 24", "lat": 36.8507360053958, "lng": -2.46001588361551, "lineas": [7]}, {"id": 422, "nombre": "Avenida. de la Cruz, 84", "lat": 36.8516542221662, "lng": -2.45775930121325, "lineas": [7]}, {"id": 423, "nombre": "Avenida Mediterráneo - Colegio Europa", "lat": 36.8592561876312, "lng": -2.44470052105835, "lineas": [2, 4]}, {"id": 424, "nombre": "Antonia Mercé", "lat": 36.8592988720243, "lng": -2.45130924421694, "lineas": [7]}, {"id": 426, "nombre": "Parking Hospital", "lat": 36.8633863131398, "lng": -2.4436435409537, "lineas": [2, 3, 4, 18]}, {"id": 427, "nombre": "Consultorio Avda. de la Cruz", "lat": 36.8526996579033, "lng": -2.45639413491316, "lineas": [7]}, {"id": 430, "nombre": "Venta Cabrera - Parque", "lat": 36.8556693731737, "lng": -2.3873203458557, "lineas": [15, 20]}, {"id": 431, "nombre": "Juegos del Mediterráneo 31", "lat": 36.8445964348047, "lng": -2.32044888760606, "lineas": [15, 30]}, {"id": 432, "nombre": "Antonio Muñoz Zamora 28", "lat": 36.8323970771878, "lng": -2.43952837097464, "lineas": [3, 7, 11]}, {"id": 433, "nombre": "Avenida Vega de Acá", "lat": 36.8347359821684, "lng": -2.43837011040983, "lineas": [3, 4, 7, 11]}, {"id": 434, "nombre": "Camino de la Goleta", "lat": 36.8359813162707, "lng": -2.43521413626316, "lineas": [7]}, {"id": 437, "nombre": "Vega de Acá 133", "lat": 36.8347223556255, "lng": -2.43853631159456, "lineas": [3, 4, 7, 12]}, {"id": 438, "nombre": "Antonio Muñoz Zamora 29", "lat": 36.8324515829729, "lng": -2.43953914707575, "lineas": [3, 7, 12]}, {"id": 440, "nombre": "Arquímedes", "lat": 36.8396932733866, "lng": -2.47482732557098, "lineas": [1]}, {"id": 441, "nombre": "La Beltraneja", "lat": 36.8457142457604, "lng": -2.43465353210643, "lineas": [6]}, {"id": 442, "nombre": "Avenida. Tolerancia, Parque", "lat": 36.8446346193935, "lng": -2.43320341732996, "lineas": [6]}, {"id": 443, "nombre": "Paseo Marítimo - Parque Andarax", "lat": 36.8160201849281, "lng": -2.43188031300073, "lineas": [11, 12, 18]}, {"id": 444, "nombre": "Parque Andarax", "lat": 36.8161107418754, "lng": -2.4315179777316, "lineas": [11, 12, 18]}, {"id": 447, "nombre": "Vega de Acá - Glorieta Patatas Salcedo", "lat": 36.8361887482004, "lng": -2.43867607803497, "lineas": [3, 4, 7, 12]}, {"id": 448, "nombre": "Avenida Vega de Acá-jardín Legión Española", "lat": 36.830241468671, "lng": -2.43816114567042, "lineas": [4]}, {"id": 449, "nombre": "Vega de Acá-camino del Bobar", "lat": 36.8218300221624, "lng": -2.4413024024337, "lineas": [4]}, {"id": 450, "nombre": "Avenida Vega de Acá-pilar Miró", "lat": 36.8243478950772, "lng": -2.43991937951405, "lineas": [4]}, {"id": 451, "nombre": "Avenida Vega de Acá-la Térmica", "lat": 36.8218548803613, "lng": -2.44139068531599, "lineas": [4]}, {"id": 452, "nombre": "Vega de Acá-parque Infantil", "lat": 36.8243186888127, "lng": -2.43983594541188, "lineas": [4]}, {"id": 453, "nombre": "Vega de Acá-jardines 28 de Junio", "lat": 36.8272856079814, "lng": -2.43809407075126, "lineas": [4]}, {"id": 454, "nombre": "Vega de Acá - Camino de la Goleta", "lat": 36.8362030056133, "lng": -2.43850391400082, "lineas": [3, 4, 7, 11]}, {"id": 455, "nombre": "Antonio Muñoz Zamora 1", "lat": 36.8320391909431, "lng": -2.44331941008565, "lineas": [3, 7, 12]}, {"id": 456, "nombre": "Antonio Muñoz Zamora 4", "lat": 36.8319987587504, "lng": -2.44324576736035, "lineas": [3, 7, 11]}, {"id": 457, "nombre": "Campo de Futbol - el Alquián", "lat": 36.852087765822, "lng": -2.34842665384127, "lineas": [15, 20, 30]}, {"id": 458, "nombre": "Complejo Deportivo los Pinos", "lat": 36.8521337022516, "lng": -2.34841997753008, "lineas": [15, 20, 30]}, {"id": 459, "nombre": "Avenida Montserrat - Gachas Colorás", "lat": 36.8398168566142, "lng": -2.44379583911355, "lineas": [4, 12, 19, 31]}, {"id": 460, "nombre": "Avenida Montserrat - Doctoral", "lat": 36.8398174722007, "lng": -2.44403392050961, "lineas": [19, 31]}, {"id": 461, "nombre": "Civitas", "lat": 36.8378161719736, "lng": -2.44777480328296, "lineas": [19, 31]}, {"id": 462, "nombre": "Divina Infantita", "lat": 36.8378935095538, "lng": -2.44800061457756, "lineas": [19, 31]}, {"id": 463, "nombre": "Juegos de Casablanca, Juegos de Argel", "lat": 36.8352288733417, "lng": -2.31643861679825, "lineas": [31]}, {"id": 464, "nombre": "Complejo Deportivo \"el Toyo\"", "lat": 36.8381691426171, "lng": -2.32254972916278, "lineas": [31]}, {"id": 465, "nombre": "Villa Mediterránea, Vuelta", "lat": 36.8445331021944, "lng": -2.32022707801655, "lineas": [31]}, {"id": 466, "nombre": "Avenida de los Juegos Mediterráneos, 2", "lat": 36.8411549172977, "lng": -2.32248260117179, "lineas": [31]}, {"id": 468, "nombre": "Avenida Montserrat - Estación de Servicio", "lat": 36.8367011612684, "lng": -2.45313384116427, "lineas": [19, 31]}, {"id": 469, "nombre": "Avenida Montserrat 45", "lat": 36.8372158283433, "lng": -2.45241438422392, "lineas": [19, 31]}, {"id": 470, "nombre": "Avenida Montserrat - Minerales", "lat": 36.8423682066193, "lng": -2.44177448899765, "lineas": [4, 12, 19, 31]}, {"id": 471, "nombre": "Avenida Montserrat - Manuel Azaña", "lat": 36.8422655442699, "lng": -2.44218412515025, "lineas": [19, 31]}, {"id": 472, "nombre": "Hotel Nh", "lat": 36.8359939381351, "lng": -2.45530507648487, "lineas": [19, 31]}, {"id": 473, "nombre": "Rambla Lechuga", "lat": 36.8505027868058, "lng": -2.371061927122, "lineas": [30]}, {"id": 474, "nombre": "Rambla Lechuga, Vuelta", "lat": 36.8505552624979, "lng": -2.37117696674652, "lineas": [30]}, {"id": 475, "nombre": "N-344 Estación de Servicio", "lat": 36.8520739939149, "lng": -2.31082090247027, "lineas": [31]}, {"id": 478, "nombre": "Rambla, Celia Viñas", "lat": 36.8381411158801, "lng": -2.46074911706942, "lineas": [1, 2, 6, 11, 18]}, {"id": 482, "nombre": "Universidad Norte", "lat": 36.8315369806518, "lng": -2.40558358207887, "lineas": [19]}, {"id": 483, "nombre": "Espacio Alma", "lat": 36.8380753287752, "lng": -2.43634704083479, "lineas": [3, 4, 7, 11]}, {"id": 484, "nombre": "Centro Comercial Torrecárdenas", "lat": 36.8627524495476, "lng": -2.43471613637885, "lineas": [5, 8]}, {"id": 485, "nombre": "Francisco Perez Company 8", "lat": 36.8581063079414, "lng": -2.44204283623156, "lineas": [5, 8]}, {"id": 486, "nombre": "Residencial Altamar", "lat": 36.8597755514148, "lng": -2.43940950822167, "lineas": [5, 8]}, {"id": 487, "nombre": "Francisco Perez Company 15", "lat": 36.859120358234, "lng": -2.44072470943578, "lineas": [5, 8]}, {"id": 488, "nombre": "Calle Acebo", "lat": 36.838036024092, "lng": -2.43509136366198, "lineas": [3, 4, 7, 11]}, {"id": 494, "nombre": "Calle Instincion 21", "lat": 36.8450605679297, "lng": -2.44146773993171, "lineas": [3]}, {"id": 501, "nombre": "Avenida Vega Aca-adolfo Suarez", "lat": 36.8271707946338, "lng": -2.43829978253504, "lineas": [4]}, {"id": 502, "nombre": "Vega Aca-adolfo Marsillach", "lat": 36.83076838123, "lng": -2.43802934876152, "lineas": [4]}, {"id": 510, "nombre": "Avenida Mediterráneo, 29", "lat": 36.8276485808752, "lng": -2.44554629773606, "lineas": [3, 12]}, {"id": 511, "nombre": "Avenida Mediterráneo - Adolfo Suárez", "lat": 36.8277887152021, "lng": -2.44545291585168, "lineas": [3, 11]}, {"id": 513, "nombre": "Calle Mármoles", "lat": 36.8415866220297, "lng": -2.43652671575543, "lineas": [3, 4, 12]}, {"id": 514, "nombre": "Pabellón del Mediterráneo", "lat": 36.8388110667933, "lng": -2.43960320949552, "lineas": [3, 4, 12]}];

const LINEAS = [
  { id: 1, nombre: "Casco Histórico", color: "#E63946", descripcion: "Recorre el centro histórico" },
  { id: 2, nombre: "Centro - Hospital Torrecárdenas", color: "#457B9D", descripcion: "Conecta el centro con el hospital" },
  { id: 3, nombre: "Torrecárdenas - Nueva Almería", color: "#2A9D8F", descripcion: "Hospital a zona residencial" },
  { id: 4, nombre: "Torrecárdenas - Universidad", color: "#E9C46A", descripcion: "Conexión universitaria" },
  { id: 5, nombre: "Centro - Villa Blanca", color: "#F4A261", descripcion: "Zona comercial" },
  { id: 6, nombre: "El Puche - Pescadería", color: "#9B5DE5", descripcion: "Barrios tradicionales" },
  { id: 7, nombre: "Piedras Redondas", color: "#00BBF9", descripcion: "Norte de la ciudad" },
  { id: 8, nombre: "Los Molinos - Torrecárdenas", color: "#00F5D4", descripcion: "Zona comercial alternativa" },
  { id: 11, nombre: "Zapillo - Universidad", color: "#F15BB5", descripcion: "Paseo marítimo y universidad" },
  { id: 12, nombre: "Nueva Andalucía - Zapillo", color: "#FEE440", descripcion: "Inversa de L11" },
  { id: 15, nombre: "Circular Levante", color: "#8AC926", descripcion: "Recorrido circular este" },
  { id: 18, nombre: "Torrecárdenas - Costacabana", color: "#FF6B6B", descripcion: "Hospital a playas" },
  { id: 19, nombre: "Gregorio Marañón - Universidad", color: "#4ECDC4", descripcion: "Ruta universitaria" },
  { id: 20, nombre: "Centro - Hospital El Toyo", color: "#45B7D1", descripcion: "Nuevo hospital" },
  { id: 30, nombre: "Almería - Aeropuerto", color: "#96CEB4", descripcion: "Conexión aeropuerto" },
  { id: 31, nombre: "Retamar directo", color: "#FFEAA7", descripcion: "Express a Retamar" }
];

// ═══════════════════════════════════════════════════════════════════════════
// SINÓNIMOS Y PUNTOS DE INTERÉS (POI)
// ═══════════════════════════════════════════════════════════════════════════

// Diccionario de sinónimos y POIs → IDs de paradas relacionadas
const SINONIMOS_POI = {
  // Hospitales y centros médicos
  'hospital': [22, 21, 332, 333], // Torrecárdenas, Materno, El Toyo
  'torrecardenas': [22, 21, 426], // Hospital + parking
  'materno': [21],
  'toyo': [332, 333],

  // Universidad y centros educativos
  'universidad': [144, 482], // Universidad
  'uni': [144, 482],
  'campus': [144],

  // Transporte
  'estacion': [292], // Estación Intermodal
  'intermodal': [292],
  'aeropuerto': [188],
  'aena': [188],

  // Comercio
  'ikea': [18],
  'carrefour': [56],
  'mediterraneo': [61, 67], // Centro Comercial Mediterráneo

  // Zonas y barrios
  'centro': [292, 420], // Centro ciudad
  'rambla': [80, 478],
  'zapillo': [165],
  'retamar': [192, 193, 195, 196],
  'alquian': [194, 195, 268, 457, 458],
  'nueva almeria': [138, 149, 150],

  // Deportes y ocio
  'estadio': [37, 320, 23, 385, 388], // Varios estadios
  'auditorio': [136, 152],
  'playa': [149, 443],
  'parque': [56, 57, 162],

  // Otros POIs
  'cementerio': [17],
  'alcazaba': [409],
  'cable ingles': [294, 318],
  'palmeral': [135, 164]
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const formatDistance = (m) => m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`;
const getLinea = (id) => LINEAS.find(l => l.id === id);

// Normalizar texto: eliminar acentos y convertir a minúsculas
const normalizeText = (str) => str
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

// Parse JSON seguro con fallback
const safeJsonParse = (value, fallback) => {
  try {
    return value !== null ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

// formatTiempo movido fuera del componente para evitar recreación
const formatTiempo = (tiempo, theme) => {
  if (!tiempo?.success) return { text: 'Sin datos', color: theme.textMuted };
  if (!tiempo.waitTimeString) return { text: tiempo.waitTimeType === 3 ? 'Sin servicio' : '...', color: theme.textMuted };
  const mins = parseInt(tiempo.waitTimeString);
  if (isNaN(mins)) return { text: tiempo.waitTimeString, color: theme.accent };
  if (mins <= 3) return { text: `${mins} min`, color: theme.success };
  if (mins <= 10) return { text: `${mins} min`, color: theme.warning };
  return { text: `${mins} min`, color: theme.danger };
};

// API usando el proxy de Vercel (evita CORS)
const API_BASE = '/api/surbus';

const fetchTiempoEspera = async (paradaId, lineaId) => {
  try {
    const res = await fetch(`${API_BASE}?l=${lineaId}&bs=${paradaId}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.success && data.error) {
      return { success: false, error: data.error };
    }
    return data;
  } catch (e) {
    return { success: false, error: e.message };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ALGORITMO DE PLANIFICACIÓN DE RUTAS
// ═══════════════════════════════════════════════════════════════════════════

const calcularRutas = (origenCoords, destinoCoords) => {
  if (!origenCoords || !destinoCoords) return [];

  const UMBRAL_TRANSBORDO = 500; // Metros - solo hacer transbordo si ahorra >500m andando
  const MAX_DISTANCIA_PARADA = 800; // Metros - radio para buscar paradas cercanas

  const rutas = [];

  // Pre-indexar paradas por línea para optimizar búsquedas (O(n) en lugar de O(n³))
  const paradasPorLinea = {};
  PARADAS.forEach(p => {
    p.lineas.forEach(l => {
      if (!paradasPorLinea[l]) paradasPorLinea[l] = [];
      paradasPorLinea[l].push(p);
    });
  });

  // 1. Encontrar paradas cercanas al origen y destino
  const paradasOrigen = PARADAS.map(p => ({
    ...p,
    distanciaAlOrigen: haversineDistance(origenCoords.lat, origenCoords.lng, p.lat, p.lng)
  })).filter(p => p.distanciaAlOrigen <= MAX_DISTANCIA_PARADA)
    .sort((a, b) => a.distanciaAlOrigen - b.distanciaAlOrigen)
    .slice(0, 10); // Top 10 paradas más cercanas al origen

  const paradasDestino = PARADAS.map(p => ({
    ...p,
    distanciaAlDestino: haversineDistance(destinoCoords.lat, destinoCoords.lng, p.lat, p.lng)
  })).filter(p => p.distanciaAlDestino <= MAX_DISTANCIA_PARADA)
    .sort((a, b) => a.distanciaAlDestino - b.distanciaAlDestino)
    .slice(0, 10); // Top 10 paradas más cercanas al destino

  if (paradasOrigen.length === 0 || paradasDestino.length === 0) return [];

  // 2. RUTAS DIRECTAS (sin transbordo)
  paradasOrigen.forEach(paradaOrigen => {
    paradasDestino.forEach(paradaDestino => {
      if (paradaOrigen.id === paradaDestino.id) return;

      // Buscar líneas en común
      const lineasComunes = paradaOrigen.lineas.filter(l => paradaDestino.lineas.includes(l));

      lineasComunes.forEach(lineaId => {
        const linea = getLinea(lineaId);
        const distanciaAndando = paradaOrigen.distanciaAlOrigen + paradaDestino.distanciaAlDestino;
        const tiempoEstimado = Math.round(distanciaAndando / 70) + 10; // ~70m/min andando + 10min bus aprox

        rutas.push({
          tipo: 'directa',
          lineas: [lineaId],
          paradas: [paradaOrigen, paradaDestino],
          distanciaAndando,
          tiempoEstimado,
          detalles: `Línea ${lineaId}`,
          segmentos: [{
            tipo: 'caminar',
            distancia: paradaOrigen.distanciaAlOrigen,
            desde: 'Origen',
            hasta: paradaOrigen.nombre
          }, {
            tipo: 'bus',
            linea: lineaId,
            color: linea.color,
            nombre: linea.nombre,
            desde: paradaOrigen.nombre,
            hasta: paradaDestino.nombre
          }, {
            tipo: 'caminar',
            distancia: paradaDestino.distanciaAlDestino,
            desde: paradaDestino.nombre,
            hasta: 'Destino'
          }]
        });
      });
    });
  });

  // 3. RUTAS CON TRANSBORDO (solo si mejora significativamente la distancia andando)
  const mejorRutaDirecta = rutas.length > 0
    ? rutas.reduce((min, r) => r.distanciaAndando < min.distanciaAndando ? r : min, rutas[0])
    : null;

  if (mejorRutaDirecta && mejorRutaDirecta.distanciaAndando > UMBRAL_TRANSBORDO) {
    paradasOrigen.forEach(paradaOrigen => {
      paradaOrigen.lineas.forEach(lineaOrigen => {
        const paradasLineaOrigen = paradasPorLinea[lineaOrigen] || [];

        paradasLineaOrigen.forEach(paradaTransbordo => {
          if (paradaTransbordo.id === paradaOrigen.id) return;

          const distanciaTransbordo = haversineDistance(
            paradaTransbordo.lat, paradaTransbordo.lng,
            destinoCoords.lat, destinoCoords.lng
          );

          // Buscar líneas que conecten al destino desde el transbordo
          paradasDestino.forEach(paradaDestino => {
            if (paradaDestino.id === paradaTransbordo.id) return;

            const lineasTransbordo = paradaTransbordo.lineas.filter(l =>
              l !== lineaOrigen && paradaDestino.lineas.includes(l)
            );

            lineasTransbordo.forEach(lineaDestino => {
              const lineaO = getLinea(lineaOrigen);
              const lineaD = getLinea(lineaDestino);

              const distanciaAndando = paradaOrigen.distanciaAlOrigen + paradaDestino.distanciaAlDestino;

              // Solo añadir si mejora significativamente vs ruta directa
              if (!mejorRutaDirecta || (mejorRutaDirecta.distanciaAndando - distanciaAndando) > UMBRAL_TRANSBORDO) {
                const tiempoEstimado = Math.round(distanciaAndando / 70) + 20; // +20min por bus y transbordo

                rutas.push({
                  tipo: 'transbordo',
                  lineas: [lineaOrigen, lineaDestino],
                  paradas: [paradaOrigen, paradaTransbordo, paradaDestino],
                  distanciaAndando,
                  tiempoEstimado,
                  detalles: `L${lineaOrigen} → L${lineaDestino}`,
                  segmentos: [{
                    tipo: 'caminar',
                    distancia: paradaOrigen.distanciaAlOrigen,
                    desde: 'Origen',
                    hasta: paradaOrigen.nombre
                  }, {
                    tipo: 'bus',
                    linea: lineaOrigen,
                    color: lineaO.color,
                    nombre: lineaO.nombre,
                    desde: paradaOrigen.nombre,
                    hasta: paradaTransbordo.nombre
                  }, {
                    tipo: 'transbordo',
                    en: paradaTransbordo.nombre
                  }, {
                    tipo: 'bus',
                    linea: lineaDestino,
                    color: lineaD.color,
                    nombre: lineaD.nombre,
                    desde: paradaTransbordo.nombre,
                    hasta: paradaDestino.nombre
                  }, {
                    tipo: 'caminar',
                    distancia: paradaDestino.distanciaAlDestino,
                    desde: paradaDestino.nombre,
                    hasta: 'Destino'
                  }]
                });
              }
            });
          });
        });
      });
    });
  }

  // Ordenar por distancia andando (prioridad) y luego por tiempo
  return rutas
    .sort((a, b) => {
      const diffAndando = a.distanciaAndando - b.distanciaAndando;
      if (Math.abs(diffAndando) > 100) return diffAndando; // Si la diferencia es >100m, priorizar menos andando
      return a.tiempoEstimado - b.tiempoEstimado; // Sino, el más rápido
    })
    .slice(0, 5);
};

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ═══════════════════════════════════════════════════════════════════════════
// HOOK PWA
// ═══════════════════════════════════════════════════════════════════════════

function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    const onBeforeInstall = (e) => { e.preventDefault(); setDeferredPrompt(e); setCanInstall(true); };
    
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    return outcome === 'accepted';
  };

  const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

  return { isOnline, isInstalled, canInstall, install };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export default function App() {
  const { isOnline, isInstalled, canInstall, install } = usePWA();
  
  const [darkMode, setDarkMode] = useState(() =>
    safeJsonParse(localStorage.getItem('surbus_dark'), true)
  );
  const [activeTab, setActiveTab] = useState('cercanas');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm); // Debouncing de búsqueda
  const [selectedParada, setSelectedParada] = useState(null);
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [favoritos, setFavoritos] = useState(() =>
    safeJsonParse(localStorage.getItem('surbus_fav'), [])
  );
  const [tiempos, setTiempos] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Estados del planificador de rutas
  const [origenCoords, setOrigenCoords] = useState(null); // { lat, lng, nombre }
  const [destinoCoords, setDestinoCoords] = useState(null); // { lat, lng, nombre }
  const [rutasCalculadas, setRutasCalculadas] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

  // Estado de vista (lista o mapa)
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // Paradas especiales: Casa y Trabajo
  const [casaParadaId, setCasaParadaId] = useState(() =>
    safeJsonParse(localStorage.getItem('surbus_casa'), null)
  );
  const [trabajoParadaId, setTrabajoParadaId] = useState(() =>
    safeJsonParse(localStorage.getItem('surbus_trabajo'), null)
  );

  // Tema
  const t = darkMode ? {
    bg: '#0a0a0f', bgCard: '#12121a', bgHover: '#1a1a25',
    text: '#ffffff', textMuted: '#8b8b9e', accent: '#00d4aa',
    border: '#2a2a3a', success: '#22c55e', warning: '#f59e0b', danger: '#ef4444',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  } : {
    bg: '#f8f9fc', bgCard: '#ffffff', bgHover: '#f0f2f5',
    text: '#1a1a2e', textMuted: '#6b7280', accent: '#0891b2',
    border: '#e5e7eb', success: '#16a34a', warning: '#d97706', danger: '#dc2626',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  // Persistir localStorage con batching (una sola escritura en lugar de 4)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('surbus_dark', JSON.stringify(darkMode));
      localStorage.setItem('surbus_fav', JSON.stringify(favoritos));
      localStorage.setItem('surbus_casa', JSON.stringify(casaParadaId));
      localStorage.setItem('surbus_trabajo', JSON.stringify(trabajoParadaId));
    }, 100); // Debounce de 100ms
    return () => clearTimeout(timer);
  }, [darkMode, favoritos, casaParadaId, trabajoParadaId]);

  // Geolocalización (ejecutar solo una vez al montar)
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalización no soportada');
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingLocation(false);
      },
      (error) => {
        const messages = {
          [error.PERMISSION_DENIED]: 'Permiso de geolocalización denegado',
          [error.TIMEOUT]: 'Timeout al obtener ubicación',
          [error.POSITION_UNAVAILABLE]: 'Ubicación no disponible'
        };
        setLocationError(messages[error.code] || 'Error al obtener ubicación');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []); // Sin dependencias - solo ejecutar una vez

  // Paradas ordenadas
  const paradasCercanas = useMemo(() => {
    if (!userLocation) return PARADAS;
    return [...PARADAS].map(p => ({
      ...p, distancia: haversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
    })).sort((a, b) => a.distancia - b.distancia);
  }, [userLocation]);

  // Búsqueda mejorada con Fuse.js, sinónimos y contexto
  const paradasFiltradas = useMemo(() => {
    const src = activeTab === 'cercanas' ? paradasCercanas : PARADAS;
    if (!deferredSearchTerm) return src;

    const searchTermNormalized = normalizeText(deferredSearchTerm);
    const searchWords = searchTermNormalized.split(/\s+/).filter(w => w.length > 0);
    let resultados = [];

    // 1. Buscar por sinónimos/POI primero
    const paradasPOI = [];
    searchWords.forEach(word => {
      Object.entries(SINONIMOS_POI).forEach(([sinonimo, paradaIds]) => {
        if (word.includes(sinonimo) || sinonimo.includes(word)) {
          paradaIds.forEach(id => {
            const parada = src.find(p => p.id === id);
            if (parada && !paradasPOI.find(p => p.id === id)) {
              paradasPOI.push(parada);
            }
          });
        }
      });
    });

    // 2. Configurar Fuse.js para búsqueda fuzzy
    const fuse = new Fuse(src, {
      keys: ['nombre', 'id'],
      threshold: 0.3, // Más estricto para evitar falsos positivos
      distance: 100,
      ignoreLocation: true,
      minMatchCharLength: 3,
      getFn: (obj, path) => {
        if (path === 'nombre') return normalizeText(obj.nombre);
        if (path === 'id') return obj.id.toString();
        return '';
      }
    });

    // 3. Buscar con cada palabra individualmente
    const fuseResultsMap = new Map();
    searchWords.forEach(word => {
      const results = fuse.search(word);
      results.forEach(result => {
        fuseResultsMap.set(result.item.id, result.item);
      });
    });

    // 4. Filtrar resultados: debe coincidir ALGUNA palabra (no todas)
    const fuseResults = Array.from(fuseResultsMap.values()).filter(parada => {
      const nombreNorm = normalizeText(parada.nombre);
      const idStr = parada.id.toString();
      const lineasStr = parada.lineas.map(l => `l${l}`).join(' ');

      // Al menos una palabra debe coincidir
      return searchWords.some(word =>
        nombreNorm.includes(word) ||
        idStr.includes(word) ||
        lineasStr.includes(word)
      );
    });

    // 5. Combinar resultados (POI primero, luego fuzzy, sin duplicados)
    const seen = new Set();
    [...paradasPOI, ...fuseResults].forEach(parada => {
      if (!seen.has(parada.id)) {
        seen.add(parada.id);
        resultados.push(parada);
      }
    });

    // 6. Búsqueda contextual: ordenar por relevancia
    if (activeTab === 'cercanas' && userLocation) {
      // En Cercanas: priorizar por distancia
      resultados.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
    } else if (selectedLinea) {
      // En vista de línea: priorizar paradas de esa línea
      resultados.sort((a, b) => {
        const aHasLinea = a.lineas.includes(selectedLinea) ? 0 : 1;
        const bHasLinea = b.lineas.includes(selectedLinea) ? 0 : 1;
        return aHasLinea - bHasLinea;
      });
    } else {
      // General: priorizar por número de líneas (más opciones)
      resultados.sort((a, b) => b.lineas.length - a.lineas.length);
    }

    return resultados;
  }, [deferredSearchTerm, paradasCercanas, activeTab, userLocation, selectedLinea]);

  // Cargar tiempos con límite de caché
  const loadTiempos = useCallback(async (parada) => {
    if (!parada) return;
    setLoading(true);
    const nuevo = {};
    await Promise.all(parada.lineas.map(async (l) => {
      nuevo[`${parada.id}-${l}`] = await fetchTiempoEspera(parada.id, l);
    }));

    // Limitar caché a últimas 100 entradas para evitar memory leak
    setTiempos(prev => {
      const combined = { ...prev, ...nuevo };
      const keys = Object.keys(combined);
      if (keys.length > 100) {
        const recentKeys = keys.slice(-100);
        return Object.fromEntries(recentKeys.map(k => [k, combined[k]]));
      }
      return combined;
    });

    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  // Auto-refresh con prevención de race conditions
  useEffect(() => {
    if (!selectedParada || !isOnline) return;

    let isCancelled = false;

    const loadData = async () => {
      if (!isCancelled) {
        await loadTiempos(selectedParada);
      }
    };

    loadData(); // Carga inicial

    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(loadData, 30000);
    }

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedParada, autoRefresh, isOnline, loadTiempos]);

  // Calcular rutas cuando cambian origen/destino
  useEffect(() => {
    if (origenCoords && destinoCoords) {
      const rutas = calcularRutas(origenCoords, destinoCoords);
      setRutasCalculadas(rutas);
      setRutaSeleccionada(rutas.length > 0 ? 0 : null); // Guardar índice en lugar de objeto
    } else {
      setRutasCalculadas([]);
      setRutaSeleccionada(null);
    }
  }, [origenCoords, destinoCoords]);

  const toggleFavorito = (id) => {
    setFavoritos(prev => {
      const isRemoving = prev.includes(id);
      // Si se está quitando de favoritos, también limpiar casa/trabajo
      if (isRemoving) {
        if (casaParadaId === id) setCasaParadaId(null);
        if (trabajoParadaId === id) setTrabajoParadaId(null);
      }
      return isRemoving ? prev.filter(x => x !== id) : [...prev, id];
    });
  };

  const formatTiempo = (tiempo) => {
    if (!tiempo?.success) return { text: 'Sin datos', color: t.textMuted };
    if (!tiempo.waitTimeString) return { text: tiempo.waitTimeType === 3 ? 'Sin servicio' : '...', color: t.textMuted };
    const mins = parseInt(tiempo.waitTimeString);
    if (isNaN(mins)) return { text: tiempo.waitTimeString, color: t.accent };
    if (mins <= 3) return { text: `${mins} min`, color: t.success };
    if (mins <= 10) return { text: `${mins} min`, color: t.warning };
    return { text: `${mins} min`, color: t.danger };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPONENTES
  // ═══════════════════════════════════════════════════════════════════════════

  const ParadaCard = ({ parada, showHomeWorkButtons = false }) => (
    <div onClick={() => setSelectedParada(parada)} style={{
      background: t.bgCard, borderRadius: 16, padding: '16px 20px', cursor: 'pointer',
      border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: t.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{parada.id}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: t.text, fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {parada.nombre}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {parada.lineas.slice(0, 5).map(l => {
            const linea = getLinea(l);
            return linea && <span key={l} style={{ background: linea.color, color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>L{l}</span>;
          })}
          {parada.lineas.length > 5 && <span style={{ color: t.textMuted, fontSize: 11 }}>+{parada.lineas.length - 5}</span>}
        </div>
        {parada.distancia !== undefined && (
          <div style={{ color: t.accent, fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Navigation size={12} />{formatDistance(parada.distancia)}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {showHomeWorkButtons && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCasaParadaId(casaParadaId === parada.id ? null : parada.id);
              }}
              style={{
                background: casaParadaId === parada.id ? t.accent : 'transparent',
                border: `1px solid ${casaParadaId === parada.id ? t.accent : t.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Marcar como Casa"
            >
              <Home size={18} color={casaParadaId === parada.id ? '#fff' : t.textMuted} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTrabajoParadaId(trabajoParadaId === parada.id ? null : parada.id);
              }}
              style={{
                background: trabajoParadaId === parada.id ? t.accent : 'transparent',
                border: `1px solid ${trabajoParadaId === parada.id ? t.accent : t.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Marcar como Trabajo"
            >
              <Briefcase size={18} color={trabajoParadaId === parada.id ? '#fff' : t.textMuted} />
            </button>
          </>
        )}
        <button onClick={(e) => { e.stopPropagation(); toggleFavorito(parada.id); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}>
          <Heart size={22} fill={favoritos.includes(parada.id) ? '#ef4444' : 'transparent'}
            color={favoritos.includes(parada.id) ? '#ef4444' : t.textMuted} />
        </button>
      </div>
    </div>
  );

  const ParadaDetail = () => {
    if (!selectedParada) return null;
    return (
      <div onClick={() => setSelectedParada(null)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: t.bg, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto'
        }}>
          <div style={{ position: 'sticky', top: 0, background: t.bg, padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 16, zIndex: 10 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: t.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{selectedParada.id}</span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: t.text, margin: 0, fontSize: 17, fontWeight: 700 }}>{selectedParada.nombre}</h2>
              <p style={{ color: t.textMuted, margin: '4px 0 0', fontSize: 13 }}>
                {selectedParada.lineas.length} líneas
                {selectedParada.distancia !== undefined && ` • ${formatDistance(selectedParada.distancia)}`}
              </p>
            </div>
            <button onClick={() => setSelectedParada(null)} style={{ background: t.bgCard, border: 'none', borderRadius: 12, padding: 10, cursor: 'pointer' }}>
              <X size={20} color={t.text} />
            </button>
          </div>

          {!isOnline && (
            <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: `${t.warning}20`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CloudOff size={18} color={t.warning} />
              <span style={{ color: t.text, fontSize: 13 }}>Sin conexión</span>
            </div>
          )}

          <div style={{ padding: '16px 24px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => loadTiempos(selectedParada)} disabled={loading || !isOnline} style={{
              flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: isOnline ? t.accent : t.textMuted, color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px 16px', fontWeight: 600, fontSize: 14, cursor: loading || !isOnline ? 'not-allowed' : 'pointer'
            }}>
              <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button onClick={() => toggleFavorito(selectedParada.id)} style={{
              background: favoritos.includes(selectedParada.id) ? t.danger : t.bgCard, color: favoritos.includes(selectedParada.id) ? '#fff' : t.text,
              border: `1px solid ${t.border}`, borderRadius: 12, padding: 12, cursor: 'pointer'
            }}>
              <Heart size={18} fill={favoritos.includes(selectedParada.id) ? '#fff' : 'transparent'} />
            </button>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedParada.lat},${selectedParada.lng}&travelmode=walking`} 
              target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bgCard,
              border: `1px solid ${t.border}`, borderRadius: 12, padding: 12
            }}>
              <Navigation size={18} color={t.text} />
            </a>
          </div>

          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: t.text, margin: 0, fontSize: 16, fontWeight: 600 }}>Próximos buses</h3>
              {lastUpdate && <span style={{ color: t.textMuted, fontSize: 12 }}>{lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedParada.lineas
                .filter(lineaId => !selectedLinea || lineaId === selectedLinea)
                .map(lineaId => {
                const linea = getLinea(lineaId);
                const tiempo = tiempos[`${selectedParada.id}-${lineaId}`];
                const fmt = formatTiempo(tiempo);
                return linea && (
                  <div key={lineaId} style={{ background: t.bgCard, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${t.border}` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: linea.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>L{lineaId}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: t.text, fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{linea.nombre}</div>
                      <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>{linea.descripcion}</div>
                    </div>
                    <div style={{ background: `${fmt.color}20`, borderRadius: 10, padding: '8px 14px', minWidth: 70, textAlign: 'center' }}>
                      <span style={{ color: fmt.color, fontWeight: 700, fontSize: 14 }}>{fmt.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LineasView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {LINEAS.map(linea => {
        const paradasLinea = PARADAS.filter(p => p.lineas.includes(linea.id));
        const isExp = selectedLinea === linea.id;
        return (
          <div key={linea.id} style={{ background: t.bgCard, borderRadius: 16, overflow: 'hidden', border: `1px solid ${isExp ? linea.color : t.border}` }}>
            <div onClick={() => setSelectedLinea(isExp ? null : linea.id)} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: linea.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>L{linea.id}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: t.text, fontWeight: 600, fontSize: 15 }}>{linea.nombre}</div>
                <div style={{ color: t.textMuted, fontSize: 13, marginTop: 2 }}>{paradasLinea.length} paradas</div>
              </div>
              <ChevronDown size={20} color={t.textMuted} style={{ transform: isExp ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </div>
            {isExp && (
              <div style={{ padding: '0 20px 16px', borderTop: `1px solid ${t.border}`, paddingTop: 16, maxHeight: 300, overflowY: 'auto' }}>
                {paradasLinea.map((p, i) => (
                  <div key={p.id} onClick={() => setSelectedParada(p)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: t.bgHover, borderRadius: 10, cursor: 'pointer', marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: linea.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{i + 1}</div>
                    <span style={{ color: t.text, fontSize: 13, flex: 1 }}>{p.nombre}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Mapa genérico para Cercanas, Favoritos y Líneas
  const GeneralMapView = ({ paradas, lineaId = null }) => {
    // Mapa colapsado por defecto en todas las vistas
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    // Centro inicial solo la primera vez, no en cada render
    const [initialCenter] = useState(() =>
      userLocation || (paradas.length > 0 ? { lat: paradas[0].lat, lng: paradas[0].lng } : { lat: 36.84, lng: -2.46 })
    );
    // Key estable - no cambia con selección de parada
    const mapKey = `${activeTab}-${lineaId || 'general'}`;

    // Icono personalizado para ubicación del usuario
    const userLocationIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background: #2196F3;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
          left: -10px;
          top: -10px;
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    return (
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setIsMapExpanded(!isMapExpanded)}
          style={{
            width: '100%',
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            color: t.text,
            fontSize: 14,
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapIcon size={18} color={t.accent} />
            Ver mapa {isMapExpanded ? '' : `(${paradas.length} paradas)`}
          </div>
          <ChevronDown
            size={18}
            style={{
              transform: isMapExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </button>

        {isMapExpanded && (
          <div style={{ height: 350, borderRadius: 12, overflow: 'hidden', border: `1px solid ${t.border}`, marginTop: 12 }}>
            <MapContainer
              key={mapKey}
              center={[initialCenter.lat, initialCenter.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Ubicación del usuario */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <strong>Tu ubicación</strong>
              </Popup>
            </Marker>
          )}

          {/* Marcadores de paradas */}
          {paradas.map((parada) => (
            <Marker
              key={parada.id}
              position={[parada.lat, parada.lng]}
              eventHandlers={{
                click: () => setSelectedParada(parada)
              }}
            >
              <Popup>
                <strong>{parada.nombre}</strong><br/>
                ID: {parada.id}<br/>
                Líneas: {parada.lineas.join(', ')}
                {parada.distancia && <><br/>Distancia: {formatDistance(parada.distancia)}</>}
              </Popup>
            </Marker>
          ))}
            </MapContainer>
          </div>
        )}
      </div>
    );
  };

  // Componente de Mapa del Planificador de Rutas
  const MapView = ({ rutas }) => {
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const center = origenCoords || destinoCoords || userLocation || { lat: 36.84, lng: -2.46 };

    return (
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setIsMapExpanded(!isMapExpanded)}
          style={{
            width: '100%',
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            color: t.text,
            fontSize: 14,
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapIcon size={18} color={t.accent} />
            Ver mapa de ruta
          </div>
          <ChevronDown
            size={18}
            style={{
              transform: isMapExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </button>

        {isMapExpanded && (
          <div style={{ height: 350, borderRadius: 12, overflow: 'hidden', border: `1px solid ${t.border}`, marginTop: 12 }}>
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marcadores de origen y destino */}
          {origenCoords && (
            <Marker position={[origenCoords.lat, origenCoords.lng]}>
              <Popup><strong>Origen:</strong> {origenCoords.nombre}</Popup>
            </Marker>
          )}

          {destinoCoords && (
            <Marker position={[destinoCoords.lat, destinoCoords.lng]}>
              <Popup><strong>Destino:</strong> {destinoCoords.nombre}</Popup>
            </Marker>
          )}

          {/* Trazar ruta seleccionada */}
          {rutaSeleccionada && rutaSeleccionada.paradas.length > 0 && (
            <>
              {rutaSeleccionada.paradas.map((parada, idx) => (
                <Marker key={idx} position={[parada.lat, parada.lng]}>
                  <Popup>{parada.nombre}</Popup>
                </Marker>
              ))}
              <Polyline
                positions={rutaSeleccionada.paradas.map(p => [p.lat, p.lng])}
                color={rutaSeleccionada.lineas.length > 0 ? getLinea(rutaSeleccionada.lineas[0]).color : t.accent}
                weight={4}
                opacity={0.7}
              />
            </>
          )}
            </MapContainer>
          </div>
        )}
      </div>
    );
  };

  // Componente Selector de Parada
  const LocationSelector = ({ label, value, onChange, placeholder }) => {
    const [searchLocal, setSearchLocal] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const paradasFiltradas = useMemo(() => {
      if (!searchLocal) return PARADAS.slice(0, 50);
      const term = searchLocal.toLowerCase();
      return PARADAS.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.id.toString().includes(term)
      ).slice(0, 20);
    }, [searchLocal]);

    return (
      <div style={{ position: 'relative' }}>
        <label style={{ display: 'block', color: t.text, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
        <div onClick={() => setShowDropdown(!showDropdown)} style={{
          background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: '12px 14px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ color: value ? t.text : t.textMuted, fontSize: 14 }}>
            {value ? value.nombre : placeholder}
          </span>
          <ChevronDown size={18} color={t.textMuted} style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        </div>

        {showDropdown && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: t.bgCard,
            border: `1px solid ${t.border}`, borderRadius: 12, maxHeight: 300, overflowY: 'auto', zIndex: 100,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            {/* Opción "Mi ubicación" */}
            {userLocation && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ lat: userLocation.lat, lng: userLocation.lng, nombre: 'Mi ubicación' });
                  setShowDropdown(false);
                }}
                style={{
                  padding: '12px 14px',
                  cursor: 'pointer',
                  background: value?.nombre === 'Mi ubicación' ? t.bgHover : 'transparent',
                  borderBottom: `1px solid ${t.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <Locate size={16} color={t.accent} />
                <div>
                  <div style={{ color: t.accent, fontSize: 13, fontWeight: 600 }}>Mi ubicación</div>
                  <div style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>Usar mi posición actual</div>
                </div>
              </div>
            )}

            <div style={{ padding: 10, borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, background: t.bgCard }}>
              <input
                type="text"
                placeholder="Buscar parada..."
                value={searchLocal}
                onChange={(e) => setSearchLocal(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.border}`,
                  background: t.bg, color: t.text, fontSize: 13, outline: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              {paradasFiltradas.map(p => (
                <div
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ lat: p.lat, lng: p.lng, nombre: p.nombre });
                    setShowDropdown(false);
                    setSearchLocal('');
                  }}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', background: value?.nombre === p.nombre ? t.bgHover : 'transparent',
                    borderBottom: `1px solid ${t.border}`
                  }}
                >
                  <div style={{ color: t.text, fontSize: 13, fontWeight: 600 }}>{p.nombre}</div>
                  <div style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>ID: {p.id} • Líneas: {p.lineas.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Widget de Trayecto Casa-Trabajo
  const CommuteWidget = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isExpanded, setIsExpanded] = useState(false);

    // Actualizar la hora cada minuto
    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 60000);
      return () => clearInterval(timer);
    }, []);

    // Determinar si es hora de ir al trabajo (6:00 - 11:00)
    const hour = currentTime.getHours();
    const isGoingToWork = hour >= 6 && hour < 11;

    // Lógica inteligente para obtener la parada relevante (usar useMemo para evitar recálculo)
    const { paradaId, rutaCalculada, esRutaDinamica } = useMemo(() => {
      let pId = null;
      let ruta = null;
      let dinamica = false;

      if (isGoingToWork) {
        // "Al curro" → mostrar tiempos de parada CASA (coges bus en casa)
        pId = casaParadaId;
      } else {
        // "A casa" → lógica inteligente
        const paradaTrabajo = trabajoParadaId ? PARADAS.find(p => p.id === trabajoParadaId) : null;
        const paradaCasa = casaParadaId ? PARADAS.find(p => p.id === casaParadaId) : null;

        if (paradaTrabajo && userLocation && paradaCasa) {
          // Calcular distancia al trabajo
          const distanciaTrabajo = haversineDistance(
            userLocation.lat, userLocation.lng,
            paradaTrabajo.lat, paradaTrabajo.lng
          );

          if (distanciaTrabajo < 500) {
            // Estás cerca del trabajo → mostrar tiempos de parada TRABAJO
            pId = trabajoParadaId;
          } else {
            // Estás lejos del trabajo → calcular ruta a casa
            const rutas = calcularRutas(
              userLocation,
              { lat: paradaCasa.lat, lng: paradaCasa.lng }
            );

            if (rutas.length > 0) {
              ruta = rutas[0]; // Primera ruta (recomendada)
              // Extraer parada origen de la ruta
              const primeraParada = ruta.paradas?.[0];
              if (primeraParada && primeraParada.id) {
                pId = primeraParada.id; // Usar el ID, no el objeto completo
                dinamica = true;
              }
            }
          }
        } else {
          // Fallback: mostrar parada trabajo si existe
          pId = trabajoParadaId;
        }
      }

      return { paradaId: pId, rutaCalculada: ruta, esRutaDinamica: dinamica };
    }, [isGoingToWork, casaParadaId, trabajoParadaId, userLocation]);

    const parada = useMemo(() =>
      paradaId ? PARADAS.find(p => p.id === paradaId) : null
    , [paradaId]);

    // Cargar tiempos automáticamente cuando se expande o cambia la parada
    useEffect(() => {
      if (isExpanded && parada && isOnline) {
        loadTiempos(parada);
      }
    }, [isExpanded, parada, isOnline]);

    // No mostrar el widget si no hay parada configurada
    if (!parada) return null;

    // Obtener las líneas de la parada y sus tiempos
    const lineasParada = parada.lineas.slice(0, 3); // Primeras 3 líneas
    const tiemposParada = lineasParada.map(lineaId => ({
      lineaId,
      linea: getLinea(lineaId),
      tiempo: tiempos[`${parada.id}-${lineaId}`] // Clave corregida: parada-linea
    }));

    return (
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: t.gradient,
          borderRadius: 12,
          padding: isExpanded ? 16 : 12,
          marginBottom: 12,
          color: '#fff',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isGoingToWork ? (
            <Briefcase size={20} />
          ) : (
            <Home size={20} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {isGoingToWork ? '⏰ Al curro' : '🏠 A casa'}
            </div>
            {!isExpanded && (
              <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>
                {parada.nombre.length > 25 ? parada.nombre.substring(0, 25) + '...' : parada.nombre}
              </div>
            )}
          </div>
          <ChevronDown
            size={18}
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </div>

        {isExpanded && (
          <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 12 }}>
            <p style={{ margin: '0 0 12px 0', fontSize: 13, opacity: 0.9 }}>
              {parada.nombre}
            </p>

            {/* Indicador de ruta dinámica */}
            {esRutaDinamica && rutaCalculada && (
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: '8px 10px',
                marginBottom: 12,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Navigation size={14} />
                <span>Ruta calculada • {formatDistance(rutaCalculada.distanciaAndando)} andando</span>
              </div>
            )}

            {/* Tiempos de las líneas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tiemposParada.map(({ lineaId, linea, tiempo }) => (
                <div
                  key={lineaId}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: linea.color,
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: 5,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      L{lineaId}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>
                      {linea.nombre}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {tiempo ? tiempo : '—'}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                loadTiempos(parada);
              }}
              disabled={loading || !isOnline}
              style={{
                marginTop: 10,
                width: '100%',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: loading || !isOnline ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Vista del Planificador de Rutas
  const RoutePlannerView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Selectores de origen y destino */}
      <div style={{ background: t.bgCard, borderRadius: 16, padding: 20, border: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <MapIcon size={24} color={t.accent} />
          <h2 style={{ margin: 0, color: t.text, fontSize: 18, fontWeight: 700 }}>Planificador de Rutas</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <LocationSelector
            label="Origen"
            value={origenCoords}
            onChange={setOrigenCoords}
            placeholder="Selecciona ubicación de origen"
          />

          <LocationSelector
            label="Destino"
            value={destinoCoords}
            onChange={setDestinoCoords}
            placeholder="Selecciona ubicación de destino"
          />

          {/* Botón intercambiar */}
          {origenCoords && destinoCoords && (
            <button
              onClick={() => {
                const temp = origenCoords;
                setOrigenCoords(destinoCoords);
                setDestinoCoords(temp);
              }}
              style={{
                background: t.bgHover, color: t.text, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'
              }}
            >
              <RefreshCw size={16} />
              Intercambiar origen y destino
            </button>
          )}
        </div>
      </div>

      {/* Mapa */}
      {(origenCoords || destinoCoords) && <MapView rutas={rutasCalculadas} />}

      {/* Resultados de rutas */}
      {rutasCalculadas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ margin: 0, color: t.text, fontSize: 16, fontWeight: 700 }}>
            {rutasCalculadas.length} {rutasCalculadas.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}
          </h3>

          {rutasCalculadas.map((ruta, idx) => (
            <div
              key={idx}
              onClick={() => setRutaSeleccionada(idx)}
              style={{
                background: t.bgCard, borderRadius: 16, padding: 16, cursor: 'pointer',
                border: `2px solid ${rutaSeleccionada === idx ? t.accent : t.border}` // Comparar por índice
              }}
            >
              {/* Badge "Recomendada" para la primera ruta */}
              {idx === 0 && (
                <div style={{
                  display: 'inline-block',
                  background: t.accent,
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 10
                }}>
                  ⚡ Recomendada
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {ruta.tipo === 'directa' ? (
                    <Zap size={20} color={t.success} />
                  ) : (
                    <Navigation size={20} color={t.warning} />
                  )}
                  <span style={{ color: t.text, fontSize: 15, fontWeight: 600 }}>
                    {ruta.detalles}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} color={t.textMuted} />
                  <span style={{ color: t.text, fontWeight: 600, fontSize: 14 }}>
                    {formatDistance(ruta.distanciaAndando)}
                  </span>
                </div>
              </div>

              {ruta.segmentos.map((seg, sidx) => (
                <div key={sidx} style={{ marginBottom: sidx < ruta.segmentos.length - 1 ? 10 : 0 }}>
                  {seg.tipo === 'caminar' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                      <MapPin size={16} color={t.textMuted} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: t.textMuted, fontSize: 12 }}>
                          Caminar {formatDistance(seg.distancia)} • {seg.desde} → {seg.hasta}
                        </div>
                      </div>
                    </div>
                  ) : seg.tipo === 'bus' ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, background: seg.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>L{seg.linea}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: t.text, fontSize: 13, fontWeight: 600 }}>{seg.nombre}</div>
                          <div style={{ color: t.textMuted, fontSize: 12 }}>{seg.desde} → {seg.hasta}</div>
                        </div>
                      </div>
                    </div>
                  ) : seg.tipo === 'transbordo' ? (
                    <div style={{ margin: '8px 0', padding: '8px 12px', background: `${t.warning}20`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={14} color={t.warning} />
                      <span style={{ color: t.warning, fontSize: 12, fontWeight: 600 }}>Transbordo en {seg.en}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {origenCoords && destinoCoords && rutasCalculadas.length === 0 && (
        <div style={{ background: t.bgCard, borderRadius: 16, padding: 40, textAlign: 'center', border: `1px solid ${t.border}` }}>
          <AlertTriangle size={48} color={t.warning} style={{ opacity: 0.5 }} />
          <p style={{ color: t.text, marginTop: 16, fontSize: 15 }}>No se encontraron rutas disponibles</p>
          <p style={{ color: t.textMuted, fontSize: 13, marginTop: 8 }}>
            No hay paradas cercanas a las ubicaciones seleccionadas o no existen líneas que las conecten.
          </p>
        </div>
      )}

      {!origenCoords && !destinoCoords && (
        <div style={{ background: t.bgCard, borderRadius: 16, padding: 40, textAlign: 'center', border: `1px solid ${t.border}` }}>
          <MapIcon size={48} color={t.accent} style={{ opacity: 0.5 }} />
          <p style={{ color: t.text, marginTop: 16, fontSize: 15 }}>Selecciona origen y destino</p>
          <p style={{ color: t.textMuted, fontSize: 13, marginTop: 8 }}>
            Elige ubicaciones de origen y destino para calcular las mejores rutas disponibles. Puedes usar tu ubicación actual.
          </p>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ minHeight: '100vh', background: t.bg, paddingBottom: 100 }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: `${t.bg}f0`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: t.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bus size={26} color="#fff" />
              </div>
              <div>
                <h1 style={{ color: t.text, margin: 0, fontSize: 22, fontWeight: 800 }}>Juan <span style={{ color: t.accent }}>Bus</span></h1>
                <p style={{ color: t.textMuted, margin: 0, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Almería {isInstalled && <Check size={12} color={t.success} />}
                  {!isOnline && <WifiOff size={12} color={t.warning} />}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {canInstall && (
                <button onClick={install} style={{ background: t.accent, border: 'none', borderRadius: 11, padding: 10, cursor: 'pointer' }}>
                  <Download size={20} color="#fff" />
                </button>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 11, padding: 10, cursor: 'pointer' }}>
                {darkMode ? <Sun size={20} color={t.text} /> : <Moon size={20} color={t.text} />}
              </button>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} color={t.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar parada, número o línea..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar paradas de autobús"
              role="searchbox"
              style={{ width: '100%', padding: '14px 44px', borderRadius: 14, border: `1px solid ${t.border}`, background: t.bgCard, color: t.text, fontSize: 15, outline: 'none' }} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} color={t.textMuted} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '16px 20px' }}>
        {/* Widget Casa-Trabajo */}
        <CommuteWidget />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'cercanas', icon: Locate, label: 'Cercanas' },
            { id: 'favoritos', icon: Star, label: 'Favoritos' },
            { id: 'lineas', icon: Bus, label: 'Líneas' },
            { id: 'rutas', icon: MapIcon, label: 'Rutas' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 11, border: 'none',
              background: activeTab === tab.id ? t.accent : t.bgCard, color: activeTab === tab.id ? '#fff' : t.textMuted,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap'
            }}>
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'favoritos' && favoritos.length > 0 && (
                <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : t.danger, color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 11 }}>{favoritos.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Toggle Vista Lista/Mapa */}
        {activeTab !== 'rutas' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10,
                border: `1px solid ${t.border}`, background: viewMode === 'list' ? t.accent : t.bgCard,
                color: viewMode === 'list' ? '#fff' : t.textMuted, fontWeight: 600, fontSize: 12,
                cursor: 'pointer'
              }}
            >
              <List size={16} />
              Lista
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10,
                border: `1px solid ${t.border}`, background: viewMode === 'map' ? t.accent : t.bgCard,
                color: viewMode === 'map' ? '#fff' : t.textMuted, fontWeight: 600, fontSize: 12,
                cursor: 'pointer'
              }}
            >
              <MapIcon size={16} />
              Mapa
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === 'cercanas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {locationError ? (
              <div style={{ background: `${t.warning}20`, borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} color={t.warning} />
                <span style={{ color: t.text, fontSize: 13, flex: 1 }}>{locationError}</span>
                <button onClick={getUserLocation} style={{ background: t.warning, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reintentar</button>
              </div>
            ) : loadingLocation ? (
              <div style={{ textAlign: 'center', padding: 40, color: t.textMuted }}>
                <Locate size={32} style={{ animation: 'spin 2s linear infinite' }} />
                <p style={{ marginTop: 12 }}>Obteniendo ubicación...</p>
              </div>
            ) : viewMode === 'list' ? (
              <>
                <p style={{ color: t.textMuted, fontSize: 13, margin: '0 0 4px' }}>{paradasFiltradas.length} paradas</p>
                {paradasFiltradas.slice(0, 50).map(p => <ParadaCard key={p.id} parada={p} />)}
              </>
            ) : (
              <GeneralMapView paradas={paradasFiltradas.slice(0, 100)} />
            )}
          </div>
        )}

        {activeTab === 'favoritos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {favoritos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: t.textMuted }}>
                <Heart size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
                <p style={{ marginTop: 16 }}>No tienes favoritos</p>
              </div>
            ) : viewMode === 'list' ? (
              PARADAS.filter(p => favoritos.includes(p.id)).map(p => <ParadaCard key={p.id} parada={p} showHomeWorkButtons={true} />)
            ) : (
              <GeneralMapView paradas={PARADAS.filter(p => favoritos.includes(p.id))} />
            )}
          </div>
        )}

        {activeTab === 'lineas' && (viewMode === 'list' ? <LineasView /> : (
          selectedLinea ? (
            <GeneralMapView
              paradas={PARADAS.filter(p => p.lineas.includes(selectedLinea))}
              lineaId={selectedLinea}
            />
          ) : (
            <div style={{ background: t.bgCard, borderRadius: 16, padding: 40, textAlign: 'center', border: `1px solid ${t.border}` }}>
              <MapIcon size={48} color={t.accent} style={{ opacity: 0.5 }} />
              <p style={{ color: t.text, marginTop: 16, fontSize: 15 }}>Selecciona una línea</p>
              <p style={{ color: t.textMuted, fontSize: 13, marginTop: 8 }}>
                Cambia a vista de lista para seleccionar una línea y ver su recorrido en el mapa.
              </p>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  marginTop: 16, background: t.accent, color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Ir a vista de lista
              </button>
            </div>
          )
        ))}

        {activeTab === 'rutas' && <RoutePlannerView />}
      </main>

      {selectedParada && <ParadaDetail />}

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: `${t.bg}f0`, backdropFilter: 'blur(20px)', borderTop: `1px solid ${t.border}`, padding: '10px 20px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isOnline ? <Wifi size={14} color={t.success} /> : <WifiOff size={14} color={t.danger} />}
            <span style={{ color: t.textMuted, fontSize: 11 }}>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <span style={{ color: t.textMuted, fontSize: 11 }}>Juan Bus v2.0 {isInstalled && '✓'}</span>
        </div>
      </div>
    </div>
  );
}
