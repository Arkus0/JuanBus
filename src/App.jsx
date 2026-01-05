import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MapPin, Bus, Clock, Star, Search, Moon, Sun, Navigation, AlertTriangle, 
  RefreshCw, ChevronRight, X, Heart, Map as MapIcon, Bell, BellOff, Share2, 
  Route, History, Settings, Locate, ChevronDown, Filter, Zap, Info, 
  ExternalLink, Wifi, WifiOff, Download, Check, CloudOff 
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DATOS DE SURBUS ALMERÍA
// ═══════════════════════════════════════════════════════════════════════════

const PARADAS = [{"id":1,"nombre":"Plaza del Quemadero","lat":36.8462014232588,"lng":-2.46708068814807,"lineas":[18]},{"id":2,"nombre":"Avenida. Pablo Iglesias","lat":36.8463132600496,"lng":-2.46473617050965,"lineas":[18]},{"id":3,"nombre":"Rambla Alfareros","lat":36.8431862152274,"lng":-2.46423861324673,"lineas":[18]},{"id":7,"nombre":"Stella Maris","lat":36.8370748907335,"lng":-2.46088098869098,"lineas":[1,6,7,12,18]},{"id":8,"nombre":"Avenida de la Estación","lat":36.8367816465867,"lng":-2.45707443839835,"lineas":[19,20,30,31]},{"id":9,"nombre":"Ronda - Sanidad","lat":36.8390741560668,"lng":-2.45471238882752,"lineas":[2,20,30]},{"id":10,"nombre":"Ronda - Blas Infante","lat":36.8414259109113,"lng":-2.45339065792903,"lineas":[2,20]},{"id":11,"nombre":"Cruz Roja","lat":36.8436824429405,"lng":-2.45243892073629,"lineas":[2,20]},{"id":12,"nombre":"Bola Azul","lat":36.8482238455009,"lng":-2.45279565453527,"lineas":[2]},{"id":13,"nombre":"La Magnesita","lat":36.8508739899171,"lng":-2.45225830965522,"lineas":[2,7]},{"id":14,"nombre":"Fábrica de Azufre","lat":36.8541588802648,"lng":-2.45188766903153,"lineas":[2,7]},{"id":15,"nombre":"Acceso Piedras Redondas","lat":36.8564929648254,"lng":-2.45149787695655,"lineas":[2,7]},{"id":16,"nombre":"Rambla Iniesta","lat":36.8588076534236,"lng":-2.45131534498086,"lineas":[2,7]},{"id":17,"nombre":"Cementerio","lat":36.8604986016527,"lng":-2.44945706776227,"lineas":[2,7]},{"id":18,"nombre":"Ikea","lat":36.8626067063927,"lng":-2.44728648073936,"lineas":[2,18]},{"id":19,"nombre":"Carretera de Huércal 24","lat":36.8620006697929,"lng":-2.44498653648447,"lineas":[2,18]},{"id":20,"nombre":"Carretera de Huércal 56","lat":36.8624206621738,"lng":-2.44312825926589,"lineas":[2,18]},{"id":21,"nombre":"Materno Infantil","lat":36.8627775653698,"lng":-2.44149728047527,"lineas":[2,3,4,18]},{"id":22,"nombre":"Hospital Universitario Torrecárdenas","lat":36.8632881413344,"lng":-2.44081704361648,"lineas":[2,3,4,18]},{"id":23,"nombre":"Estadio Municipal Juan Rojas","lat":36.8646632178115,"lng":-2.44025085629455,"lineas":[2,3,4,18]},{"id":24,"nombre":"Asociación de Vecinos la Torre","lat":36.8633460668561,"lng":-2.44291103115972,"lineas":[2,18]},{"id":25,"nombre":"Acceso Piedras Redondas","lat":36.8565382399653,"lng":-2.45088134003491,"lineas":[2,7]},{"id":26,"nombre":"Fábrica de Azufre","lat":36.8541959970679,"lng":-2.45142892298076,"lineas":[2,7]},{"id":27,"nombre":"Ronda - la Magnesita","lat":36.8509110978419,"lng":-2.45181871505575,"lineas":[2,7]},{"id":28,"nombre":"Ronda - Bola Azul","lat":36.8482547461792,"lng":-2.45229942379003,"lineas":[2]},{"id":29,"nombre":"Ronda - Cruz Roja","lat":36.8436639844401,"lng":-2.45281289755315,"lineas":[2,20]},{"id":30,"nombre":"Ronda - Juzgados","lat":36.8414074523875,"lng":-2.45389119837297,"lineas":[2,20]},{"id":31,"nombre":"Sanidad","lat":36.8390926145485,"lng":-2.45520901613477,"lineas":[2,20,30]},{"id":32,"nombre":"Gregorio Marañón 45","lat":36.8427095078691,"lng":-2.45709513970258,"lineas":[2,5,6,8,11,20,30]},{"id":33,"nombre":"Gregorio Marañón - la Salle","lat":36.8456577986952,"lng":-2.45847295746458,"lineas":[2,5,6,8,11,19,20,30]},{"id":37,"nombre":"Estadio de la Juventud","lat":36.8375266009476,"lng":-2.46499809032717,"lineas":[1,5,6,7,8,11,12,18]},{"id":39,"nombre":"Calle Fernández Bueso","lat":36.8362296006768,"lng":-2.46306765945763,"lineas":[1,5,6,7,8,12,18]},{"id":40,"nombre":"Calle América","lat":36.8351772028508,"lng":-2.46119546906337,"lineas":[1,5,6,7,8,12,18]},{"id":41,"nombre":"Cabo de Gata - Villa García","lat":36.8338987635004,"lng":-2.45769298966217,"lineas":[1,7,11,12,18]},{"id":42,"nombre":"Cabo de Gata - San Miguel","lat":36.8328833825827,"lng":-2.4550090391445,"lineas":[1,7,11,12,18]},{"id":43,"nombre":"Cabo de Gata - Club Náutico","lat":36.8322680017105,"lng":-2.45320707463742,"lineas":[1,11,12,18]},{"id":44,"nombre":"Oliveros","lat":36.8386617296633,"lng":-2.46183354541227,"lineas":[1,6,12,18]},{"id":47,"nombre":"Club Náutico","lat":36.8322680017105,"lng":-2.45273244273774,"lineas":[1,11,12,18]},{"id":48,"nombre":"San Miguel","lat":36.8328833825827,"lng":-2.45456169426822,"lineas":[1,7,11,12,18]},{"id":49,"nombre":"Villa García","lat":36.8339357803118,"lng":-2.45727466785888,"lineas":[1,7,11,12,18]},{"id":50,"nombre":"La Salle","lat":36.845618697414,"lng":-2.45896031234062,"lineas":[2,5,6,8,11,19,20,30]},{"id":51,"nombre":"Obelisco","lat":36.8469033073887,"lng":-2.46152825590855,"lineas":[5,6,8,11]},{"id":52,"nombre":"Plaza Altamira","lat":36.8476078985054,"lng":-2.4638067493991,"lineas":[5,8]},{"id":53,"nombre":"Doctor Carracido","lat":36.8477955084191,"lng":-2.46516673031652,"lineas":[5,8]},{"id":54,"nombre":"Blas Infante","lat":36.8480201351443,"lng":-2.46713716118599,"lineas":[5,8]},{"id":55,"nombre":"Arcipreste de Hita","lat":36.8470848489193,"lng":-2.46915128476696,"lineas":[5,8]},{"id":56,"nombre":"Parque Carrefour","lat":36.8440861605918,"lng":-2.47001882003632,"lineas":[5,8]},{"id":57,"nombre":"Parque del Generalife","lat":36.841249229803,"lng":-2.47051637729929,"lineas":[5,8]},{"id":58,"nombre":"Avenida Mediterráneo 298","lat":36.8359295706636,"lng":-2.47229949813683,"lineas":[5,8]},{"id":59,"nombre":"Avenida Mediterráneo - Carretera de Níjar","lat":36.8327571605133,"lng":-2.47306334611779,"lineas":[5,8]},{"id":60,"nombre":"Avenida Mediterráneo - San Luis","lat":36.8308891790652,"lng":-2.47254794251031,"lineas":[5,8,11,12]},{"id":61,"nombre":"Avenida Mediterráneo - Centro Comercial","lat":36.8277167689169,"lng":-2.47168040723834,"lineas":[5,8,11,12]},{"id":65,"nombre":"Villa Blanca - Parque","lat":36.8474387470672,"lng":-2.46961669567948,"lineas":[5,8]},{"id":66,"nombre":"Costa de Almería 33","lat":36.8481803550065,"lng":-2.46784131143505,"lineas":[5,8]},{"id":67,"nombre":"Centro Comercial Mediterráneo","lat":36.8260734675126,"lng":-2.47094903241492,"lineas":[5,8,11,12]},{"id":68,"nombre":"Barrio San Luis","lat":36.8295075200609,"lng":-2.47204607254723,"lineas":[5,8,11,12]},{"id":69,"nombre":"Jefatura Policía Local","lat":36.8390741560668,"lng":-2.47134666205794,"lineas":[5,8]},{"id":70,"nombre":"Avenida Mediterráneo 233","lat":36.8382557157138,"lng":-2.47148420009401,"lineas":[5,8]},{"id":71,"nombre":"Plaza Nueva Andalucía","lat":36.8245439152716,"lng":-2.4700933451231,"lineas":[5,8,11,12]},{"id":72,"nombre":"IES Azcona","lat":36.8233977170219,"lng":-2.46879867396825,"lineas":[11,12]},{"id":74,"nombre":"Conservatorio de Música","lat":36.8216435847346,"lng":-2.46589111037135,"lineas":[11,12]},{"id":75,"nombre":"Plaza de Pescadores","lat":36.8202624673746,"lng":-2.46352905450638,"lineas":[11,12]},{"id":76,"nombre":"Calle Valdivia","lat":36.818693933793,"lng":-2.46105358097412,"lineas":[11,12]},{"id":77,"nombre":"Avenida. del Mar, 106","lat":36.8181648040397,"lng":-2.45819970466561,"lineas":[11,12]},{"id":78,"nombre":"Avenida. del Mar, 50","lat":36.8187493587727,"lng":-2.45535974152245,"lineas":[11,12]},{"id":79,"nombre":"Avenida del Mar 39","lat":36.8203178923553,"lng":-2.4529792285695,"lineas":[11,12]},{"id":80,"nombre":"Rambla 54","lat":36.8364358890668,"lng":-2.46706676497259,"lineas":[1,6]},{"id":81,"nombre":"Granja Escuela","lat":36.8350048975892,"lng":-2.48176187002555,"lineas":[3]},{"id":82,"nombre":"Los Díaz","lat":36.8365004639795,"lng":-2.48408035137254,"lineas":[3]},{"id":83,"nombre":"Plaza Fátima","lat":36.8382185988666,"lng":-2.48648798125424,"lineas":[3]},{"id":84,"nombre":"Polígono la Mezquita","lat":36.839948987606,"lng":-2.49186277402652,"lineas":[3]},{"id":94,"nombre":"Terrazas Almadrabillas","lat":36.8368945042988,"lng":-2.45620097822679,"lineas":[19]},{"id":96,"nombre":"El Ingenio","lat":36.8422228855987,"lng":-2.4871063232407,"lineas":[3]},{"id":97,"nombre":"Molino Rojo","lat":36.8400629367693,"lng":-2.49406516219803,"lineas":[3]},{"id":98,"nombre":"Carretera de Níjar - los Díaz","lat":36.8364559637938,"lng":-2.48328065705661,"lineas":[3]},{"id":99,"nombre":"Carretera de Níjar - Granja Escuela","lat":36.8350048975892,"lng":-2.48133062138763,"lineas":[3]},{"id":101,"nombre":"Fuente de los Peces","lat":36.8376837842108,"lng":-2.46695091110706,"lineas":[1,5,6,7,8,11,12,18]},{"id":102,"nombre":"La Curva, Nicolás Salmerón","lat":36.8343341107461,"lng":-2.46877082761889,"lineas":[6]},{"id":104,"nombre":"San Roque","lat":36.8322865601861,"lng":-2.46750400281352,"lineas":[6]},{"id":107,"nombre":"Iglesia Piedras Redondas","lat":36.860312602298,"lng":-2.45196551537987,"lineas":[7]},{"id":108,"nombre":"Residencia Alborán","lat":36.858389502915,"lng":-2.45171513705476,"lineas":[7]},{"id":109,"nombre":"Sierra de Gredos","lat":36.8508924484028,"lng":-2.44800887124913,"lineas":[4]},{"id":111,"nombre":"Maestría","lat":36.8505847448706,"lng":-2.44645300928324,"lineas":[4]},{"id":112,"nombre":"Carretera de Granada 213","lat":36.849782632093,"lng":-2.44409095341834,"lineas":[4]},{"id":113,"nombre":"Carretera de Granada 145","lat":36.8480015767175,"lng":-2.44170104389788,"lineas":[4]},{"id":114,"nombre":"Rambla - Vaguada","lat":36.846148428427,"lng":-2.43834225178497,"lineas":[4]},{"id":115,"nombre":"Rambla - Obelisco","lat":36.8438672761141,"lng":-2.43595234226444,"lineas":[4,11,12]},{"id":116,"nombre":"Mamí - Cauce","lat":36.8395612535621,"lng":-2.43227885991885,"lineas":[4,11,12]},{"id":117,"nombre":"Vaguada","lat":36.8464006564287,"lng":-2.43915586927624,"lineas":[4]},{"id":126,"nombre":"Mamí - Iglesia","lat":36.8345650114159,"lng":-2.42877638051758,"lineas":[4,11,12]},{"id":127,"nombre":"Mamí 140","lat":36.8310752783973,"lng":-2.4255084991457,"lineas":[4,11,12]},{"id":128,"nombre":"Araceli - Parque","lat":36.8262594668596,"lng":-2.42225454094849,"lineas":[4,11,12]},{"id":130,"nombre":"Cruz de Caravaca","lat":36.8251873021333,"lng":-2.41946065463805,"lineas":[4,11,12]},{"id":131,"nombre":"Araceli","lat":36.826259466858,"lng":-2.42178598588352,"lineas":[4,11,12]},{"id":133,"nombre":"California","lat":36.8311677455188,"lng":-2.4462175369257,"lineas":[11,12,18]},{"id":134,"nombre":"Cabo de Gata - Zapillo","lat":36.8318538780852,"lng":-2.45016337529294,"lineas":[11,12,18]},{"id":135,"nombre":"Paseo Marítimo - el Palmeral","lat":36.8310197534847,"lng":-2.44428740355849,"lineas":[11,12]},{"id":136,"nombre":"Paseo Marítimo - Auditorio","lat":36.8289103619679,"lng":-2.44104737218518,"lineas":[11,12]},{"id":137,"nombre":"Paseo Marítimo - Residencia de Mayores","lat":36.8260179425933,"lng":-2.43724489278377,"lineas":[11,12]},{"id":138,"nombre":"Paseo Marítimo - Nueva Almería","lat":36.8234656425299,"lng":-2.43355749726289,"lineas":[11,12]},{"id":140,"nombre":"Paseo Marítimo - Río Andarax","lat":36.8219710715753,"lng":-2.42865268780586,"lineas":[4,11,12]},{"id":141,"nombre":"Paseo Marítimo - la Cabaña","lat":36.821416823117,"lng":-2.42512236205521,"lineas":[4,11,12]},{"id":142,"nombre":"Paseo Marítimo - el Bobar","lat":36.8213428094893,"lng":-2.42153572359283,"lineas":[4,11,12]},{"id":143,"nombre":"Paseo Marítimo - Trafariña","lat":36.8220080883869,"lng":-2.41826784222088,"lineas":[4,11,12]},{"id":144,"nombre":"Universidad","lat":36.8268184351376,"lng":-2.40891337394718,"lineas":[4,11,12,19]},{"id":145,"nombre":"Trafariña","lat":36.8227033044816,"lng":-2.41700101741551,"lineas":[4,11,12]},{"id":147,"nombre":"La Cabaña","lat":36.8213984763428,"lng":-2.42352399640816,"lineas":[4,11,12]},{"id":149,"nombre":"Playa","lat":36.8221746019251,"lng":-2.42810142609113,"lineas":[4,11,12]},{"id":150,"nombre":"Nueva Almería","lat":36.8248610402048,"lng":-2.43206447420682,"lineas":[11,12]},{"id":151,"nombre":"Quinto Pino","lat":36.8273023902976,"lng":-2.43634350531358,"lineas":[11,12]},{"id":152,"nombre":"Auditorio","lat":36.8296676104403,"lng":-2.44018614454082,"lineas":[11,12]},{"id":154,"nombre":"Avenida Mediterráneo - Auditorio","lat":36.8327201437067,"lng":-2.44289711798432,"lineas":[11,12]},{"id":155,"nombre":"Parque de las Familias","lat":36.8361357699211,"lng":-2.44621753692574,"lineas":[11,12]},{"id":156,"nombre":"Zeus","lat":36.8391295810461,"lng":-2.44981885561118,"lineas":[5,6,8,11,12]},{"id":157,"nombre":"Avenida Mediterráneo 104","lat":36.8413889940988,"lng":-2.4527573037976,"lineas":[5,8,11,12]},{"id":158,"nombre":"Avenida Mediterráneo - Cortijo Grande","lat":36.8395797120389,"lng":-2.45041375361798,"lineas":[5,6,8,11,12]},{"id":161,"nombre":"La Fuente","lat":36.8338617466889,"lng":-2.4495413536179,"lineas":[11,12,18]},{"id":162,"nombre":"Avenida Mediterráneo 45","lat":36.8434578337696,"lng":-2.45537365469768,"lineas":[5,8,11,12]},{"id":163,"nombre":"Avenida Mediterráneo 23","lat":36.8468478824088,"lng":-2.46042295615588,"lineas":[5,6,8,11]},{"id":164,"nombre":"Cabo de Gata - el Palmeral","lat":36.8324755911745,"lng":-2.44808671759841,"lineas":[11,12,18]},{"id":165,"nombre":"Plaza del Zapillo","lat":36.8318909612792,"lng":-2.45219807861974,"lineas":[1,11,12,18]},{"id":166,"nombre":"Cabo de Gata - California","lat":36.8311862284599,"lng":-2.44639384421387,"lineas":[11,12,18]},{"id":167,"nombre":"El Charco","lat":36.8316492784042,"lng":-2.40598100259224,"lineas":[18]},{"id":168,"nombre":"Costacabana - Pistas Deportivas","lat":36.8277722439334,"lng":-2.40112252525638,"lineas":[18]},{"id":169,"nombre":"Plaza de Costacabana","lat":36.8264651601974,"lng":-2.39771004464273,"lineas":[18]},{"id":171,"nombre":"Rhin","lat":36.8274461720376,"lng":-2.39958224503699,"lineas":[18]},{"id":172,"nombre":"Volga","lat":36.8291395439613,"lng":-2.40270540724739,"lineas":[18]},{"id":174,"nombre":"Regiones","lat":36.8468109656009,"lng":-2.45927859331428,"lineas":[6,11]},{"id":175,"nombre":"Los Partidores","lat":36.8433854253889,"lng":-2.46853436247206,"lineas":[6]},{"id":176,"nombre":"Los Picos","lat":36.8446253853246,"lng":-2.46661785477779,"lineas":[6]},{"id":177,"nombre":"La Cañada 50","lat":36.8339728971179,"lng":-2.47700339268962,"lineas":[15,20]},{"id":179,"nombre":"Plaza de la Cañada","lat":36.8324755911745,"lng":-2.47855925465558,"lineas":[15,20]},{"id":180,"nombre":"Carretera de Níjar 280","lat":36.8327386021822,"lng":-2.47547537707311,"lineas":[15,20]},{"id":181,"nombre":"Kilómetro 5 - la Cañada","lat":36.8358741456897,"lng":-2.4695153236324,"lineas":[15,20]},{"id":183,"nombre":"IES Portocarrero","lat":36.8366312135517,"lng":-2.46594742308292,"lineas":[15,20]},{"id":188,"nombre":"Aeropuerto","lat":36.8485604232618,"lng":-2.37299156188965,"lineas":[30]},{"id":189,"nombre":"Kilómetro 8","lat":36.8380981078051,"lng":-2.39231300354004,"lineas":[15,30]},{"id":190,"nombre":"La Venta","lat":36.8363127885693,"lng":-2.40103483544853,"lineas":[15,30]},{"id":191,"nombre":"El Chalet","lat":36.8352789491936,"lng":-2.40660792732061,"lineas":[15,30]},{"id":192,"nombre":"Kilómetro 9 - Retamar","lat":36.8355050433881,"lng":-2.38517856597901,"lineas":[15,30]},{"id":193,"nombre":"El Alquián - Retamar","lat":36.8342914584342,"lng":-2.37869083881378,"lineas":[15,30]},{"id":194,"nombre":"IES el Alquián","lat":36.833826892958,"lng":-2.37453520577157,"lineas":[15,30]},{"id":195,"nombre":"El Alquián - Almería","lat":36.8341989912887,"lng":-2.37799668878029,"lineas":[15,30]},{"id":196,"nombre":"Kilómetro 9 - Almería","lat":36.8354865849113,"lng":-2.38440287464856,"lineas":[15,30]},{"id":197,"nombre":"El Chalet","lat":36.8355420601996,"lng":-2.40618792369339,"lineas":[15,30]},{"id":198,"nombre":"La Venta","lat":36.8363682135517,"lng":-2.40050551766578,"lineas":[15,30]},{"id":199,"nombre":"Kilómetro 8","lat":36.8381535327858,"lng":-2.39177223700401,"lineas":[15,30]},{"id":204,"nombre":"Los Ángeles","lat":36.8336544611281,"lng":-2.48553185463047,"lineas":[3]},{"id":205,"nombre":"Agua Fresca","lat":36.8330051626783,"lng":-2.47820405405759,"lineas":[15,20]},{"id":206,"nombre":"Kilómetro 5","lat":36.8359295706636,"lng":-2.46997512732449,"lineas":[15,20]},{"id":207,"nombre":"Carretera de Níjar 239","lat":36.8341805328122,"lng":-2.47458999545177,"lineas":[15,20]},{"id":208,"nombre":"Plaza de la Cañada - Iglesia","lat":36.8325125233731,"lng":-2.47917578697559,"lineas":[15,20]},{"id":210,"nombre":"La Cañada 51","lat":36.8339728971179,"lng":-2.47726768418008,"lineas":[15,20]},{"id":211,"nombre":"Los Picos - Casi","lat":36.8447178524533,"lng":-2.46710148886548,"lineas":[6]},{"id":212,"nombre":"Los Partidores - Casi","lat":36.8434594085661,"lng":-2.46896477083753,"lineas":[6]},{"id":292,"nombre":"Estación Intermodal","lat":36.8388127972142,"lng":-2.45613113476832,"lineas":[19,20,30,31]},{"id":293,"nombre":"Artés de Arcos","lat":36.8372608900795,"lng":-2.45666536672837,"lineas":[19,20,30,31]},{"id":298,"nombre":"Paseo de la Caridad","lat":36.8386556550296,"lng":-2.46499417715195,"lineas":[1,18]},{"id":328,"nombre":"Plaza San Sebastián","lat":36.8434024087868,"lng":-2.46360690085573,"lineas":[6,18]},{"id":329,"nombre":"Santos Zárate","lat":36.844061900531,"lng":-2.46539194215566,"lineas":[1,18]},{"id":484,"nombre":"Centro Comercial Torrecárdenas","lat":36.8663350606712,"lng":-2.43883200801184,"lineas":[3,4,5,8,18]}];

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

// API usando el proxy de Vercel (evita CORS)
const API_BASE = '/api/surbus';

const fetchTiempoEspera = async (paradaId, lineaId) => {
  try {
    const res = await fetch(`${API_BASE}?l=${lineaId}&bs=${paradaId}`);
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
};

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
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('surbus_dark');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [activeTab, setActiveTab] = useState('cercanas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParada, setSelectedParada] = useState(null);
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [favoritos, setFavoritos] = useState(() => JSON.parse(localStorage.getItem('surbus_fav') || '[]'));
  const [tiempos, setTiempos] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // Persistir
  useEffect(() => { localStorage.setItem('surbus_dark', JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('surbus_fav', JSON.stringify(favoritos)); }, [favoritos]);

  // Geolocalización
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) return setLocationError('Geolocalización no soportada');
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLoadingLocation(false); },
      () => { setLocationError('No se pudo obtener ubicación'); setLoadingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => { getUserLocation(); }, [getUserLocation]);

  // Paradas ordenadas
  const paradasCercanas = useMemo(() => {
    if (!userLocation) return PARADAS;
    return [...PARADAS].map(p => ({
      ...p, distancia: haversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
    })).sort((a, b) => a.distancia - b.distancia);
  }, [userLocation]);

  const paradasFiltradas = useMemo(() => {
    const src = activeTab === 'cercanas' ? paradasCercanas : PARADAS;
    if (!searchTerm) return src;
    const term = searchTerm.toLowerCase();
    return src.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.id.toString().includes(term) ||
      p.lineas.some(l => `l${l}`.includes(term))
    );
  }, [searchTerm, paradasCercanas, activeTab]);

  // Cargar tiempos
  const loadTiempos = useCallback(async (parada) => {
    if (!parada) return;
    setLoading(true);
    const nuevo = {};
    await Promise.all(parada.lineas.map(async (l) => {
      nuevo[`${parada.id}-${l}`] = await fetchTiempoEspera(parada.id, l);
    }));
    setTiempos(prev => ({ ...prev, ...nuevo }));
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedParada && isOnline) {
      loadTiempos(selectedParada);
      if (autoRefresh) {
        const iv = setInterval(() => loadTiempos(selectedParada), 30000);
        return () => clearInterval(iv);
      }
    }
  }, [selectedParada, loadTiempos, autoRefresh, isOnline]);

  const toggleFavorito = (id) => setFavoritos(prev => 
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

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

  const ParadaCard = ({ parada }) => (
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
      <button onClick={(e) => { e.stopPropagation(); toggleFavorito(parada.id); }} 
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}>
        <Heart size={22} fill={favoritos.includes(parada.id) ? '#ef4444' : 'transparent'} 
          color={favoritos.includes(parada.id) ? '#ef4444' : t.textMuted} />
      </button>
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
              {selectedParada.lineas.map(lineaId => {
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
                <h1 style={{ color: t.text, margin: 0, fontSize: 22, fontWeight: 800 }}>Surbus<span style={{ color: t.accent }}>+</span></h1>
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
              <button onClick={() => setDarkMode(!darkMode)} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 11, padding: 10, cursor: 'pointer' }}>
                {darkMode ? <Sun size={20} color={t.text} /> : <Moon size={20} color={t.text} />}
              </button>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} color={t.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Buscar parada, número o línea..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '14px 44px', borderRadius: 14, border: `1px solid ${t.border}`, background: t.bgCard, color: t.text, fontSize: 15, outline: 'none' }} />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} color={t.textMuted} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '16px 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'cercanas', icon: Locate, label: 'Cercanas' },
            { id: 'favoritos', icon: Star, label: 'Favoritos' },
            { id: 'lineas', icon: Bus, label: 'Líneas' },
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
            ) : (
              <>
                <p style={{ color: t.textMuted, fontSize: 13, margin: '0 0 4px' }}>{paradasFiltradas.length} paradas</p>
                {paradasFiltradas.slice(0, 50).map(p => <ParadaCard key={p.id} parada={p} />)}
              </>
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
            ) : (
              PARADAS.filter(p => favoritos.includes(p.id)).map(p => <ParadaCard key={p.id} parada={p} />)
            )}
          </div>
        )}

        {activeTab === 'lineas' && <LineasView />}
      </main>

      {selectedParada && <ParadaDetail />}

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: `${t.bg}f0`, backdropFilter: 'blur(20px)', borderTop: `1px solid ${t.border}`, padding: '10px 20px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isOnline ? <Wifi size={14} color={t.success} /> : <WifiOff size={14} color={t.danger} />}
            <span style={{ color: t.textMuted, fontSize: 11 }}>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <span style={{ color: t.textMuted, fontSize: 11 }}>Surbus+ v2.0 {isInstalled && '✓'}</span>
        </div>
      </div>
    </div>
  );
}
