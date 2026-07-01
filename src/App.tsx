/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  Layers, 
  Sun, 
  Cloud, 
  TreePine, 
  Download, 
  RefreshCw, 
  Eye, 
  Sliders,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Home,
  Info,
  Upload,
  Trash2,
  Building,
  Lightbulb,
  Gauge,
  Map,
  Paintbrush,
  Eraser,
  RotateCcw,
  Check,
  Crop
} from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'exterior' | 'interior' | 'planning'>('exterior');
  const [planningDetails, setPlanningDetails] = useState<string[]>(['cay-coi', 'building', 'bao-canh', 'nha-xe']);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [timeOfDay, setTimeOfDay] = useState<string>('sunset');
  const [stylePreset, setStylePreset] = useState<string>('hien-dai');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'comparison' | 'realistic' | 'sketch' | 'edit'>('comparison');
  const [colorTemp, setColorTemp] = useState<number>(4500);
  const [environment, setEnvironment] = useState<string>('duong-pho-vn');
  const [uploadedSketch, setUploadedSketch] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedReference, setUploadedReference] = useState<string | null>(null);
  const [isDraggingRef, setIsDraggingRef] = useState<boolean>(false);
  const [buildingType, setBuildingType] = useState<string>('biet-thu');
  const [quality, setQuality] = useState<string>('8k');
  const [aspectRatio, setAspectRatio] = useState<string>('original');
  const [uploadedSketchRatio, setUploadedSketchRatio] = useState<number | null>(null);

  // Chỉnh sửa ảnh (Inpainting) state
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [brushSize, setBrushSize] = useState<number>(30);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(true); // true = brush, false = eraser
  const [isInpaintingGenerating, setIsInpaintingGenerating] = useState<boolean>(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  useEffect(() => {
    const targetSrc = uploadedSketch || uploadedReference;
    if (targetSrc) {
      const img = new Image();
      img.src = targetSrc;
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        setUploadedSketchRatio(ratio);
        setAspectRatio('original');
      };
    } else {
      setUploadedSketchRatio(null);
    }
  }, [uploadedSketch, uploadedReference]);

  const getCanvasDimensions = () => {
    let ratio = 1;
    if (aspectRatio === 'original') {
      ratio = uploadedSketchRatio || 1;
    } else if (aspectRatio === '16:9') {
      ratio = 16 / 9;
    } else if (aspectRatio === '4:3') {
      ratio = 4 / 3;
    } else if (aspectRatio === '9:16') {
      ratio = 9 / 16;
    } else if (aspectRatio === '21:9') {
      ratio = 21 / 9;
    }
    return {
      width: 800,
      height: Math.round(800 / ratio)
    };
  };

  const buildingTypeTranslations: Record<string, string> = {
    'nha-pho': 'townhouse',
    'biet-thu': 'luxury villa',
    'cao-tang': 'high-rise commercial building',
    'truong-hoc': 'modern school campus',
    'tttm': 'vibrant shopping mall',
    'nha-hang': 'elegant restaurant building',
    'tuyen-pho': 'bustling streetscape',
    'resort': 'luxury holiday resort',
    'do-thi': 'planned urban residential area'
  };

  const buildingTypeVN: Record<string, string> = {
    'nha-pho': 'Nhà phố',
    'biet-thu': 'Biệt thự',
    'cao-tang': 'Tòa nhà cao tầng',
    'truong-hoc': 'Trường học',
    'tttm': 'Trung tâm thương mại',
    'nha-hang': 'Nhà hàng',
    'tuyen-pho': 'Tuyến phố',
    'resort': 'Khu nghỉ dưỡng',
    'do-thi': 'Khu đô thị'
  };

  const stylePresetTranslations: Record<string, string> = {
    'hien-dai': 'sleek minimalist modern design with clean lines',
    'neo-classic': 'elegant neoclassical detailing, classical ornaments, and grand symmetrical forms',
    'indochine': 'luxurious Indochine colonial style blending French architecture with local tropical accents',
    'wabi-sabi': 'rustic warm wabi-sabi aesthetic with textured plaster walls and natural organic imperfections',
    'minimalist': 'ultra-minimalist design highlighting spacious pure forms and clean concrete panels',
    'industrial': 'raw loft industrial design with exposed steel beams, rustic brickwork, and polished concrete',
    'scandinavian': 'cozy Scandinavian style featuring light wood timber, clean lines, and Nordic hygge atmosphere',
    'japandi': 'serene Japandi fusion style of Japanese minimalism and warm Scandinavian wooden elements'
  };

  const stylePresetVN: Record<string, string> = {
    'hien-dai': 'Hiện đại',
    'neo-classic': 'Neo classic',
    'indochine': 'Indochine',
    'wabi-sabi': 'Wabi sabi',
    'minimalist': 'Minimalist',
    'industrial': 'Industrial',
    'scandinavian': 'Scandinavian',
    'japandi': 'Japandi'
  };

  const environmentTranslations: Record<string, string> = {
    'duong-pho-vn': 'Vietnamese urban street background with adjacent typical local neighbor houses and light poles',
    'lang-que-vn': 'idyllic peaceful Vietnamese rural countryside scene with rich green rice fields and authentic rusticity',
    'vuon-chau-au': 'classic landscaped European garden background filled with trimmed geometric hedges, stone walkways, and serene fountains',
    'biet-thu-hn-dat-trong': 'exclusive luxury residential area in Hanoi surrounded by a spacious clean empty green plot of land',
    'duong-pho-hoi-an': 'ancient Hoi An historical street atmosphere with glowing traditional lanterns and golden-yellow heritage shopfronts',
    'biet-thu-hn-hang-xom': 'upscale Hanoi neighborhood featuring high-end villas integrated with close elegant adjacent structures'
  };

  const environmentVN: Record<string, string> = {
    'duong-pho-vn': 'Đường phố VN (nhà hàng xóm)',
    'lang-que-vn': 'Vùng làng quê VN',
    'vuon-chau-au': 'Vườn châu Âu',
    'biet-thu-hn-dat-trong': 'Biệt thự Hà Nội (đất trống)',
    'duong-pho-hoi-an': 'Đường phố Hội An',
    'biet-thu-hn-hang-xom': 'Biệt thự Hà Nội (nhà hàng xóm)'
  };

  const lightingTranslations: Record<string, string> = {
    'nang-chieu': 'warm afternoon sunlight of 4:30 PM with long dramatic shadows',
    'overcast': 'soft diffused overcast daylight with subtle gentle shadows',
    'sunset': 'exquisite deep orange sunset with a warm dramatic horizon glow',
    'blue-hour': 'mystical deep blue hour ambiance with glowing building interior lights',
    'spring': 'vibrant and fresh spring morning sun with a lush bright atmosphere',
    'midday': 'harsh vertical midday sun with strong contrasting shadows',
    'rainy': 'cinematic rainy weather with wet reflective ground and moody atmosphere'
  };

  const lightingVN: Record<string, string> = {
    'nang-chieu': 'Nắng chiều 16:30',
    'overcast': 'Trời âm u (Overcast)',
    'sunset': 'Trời hoàng hôn',
    'blue-hour': 'Chạng vạng xanh (Blue Hour)',
    'spring': 'Mùa xuân tươi mới',
    'midday': 'Nắng gắt Midday',
    'rainy': 'Trời mưa Cinematic'
  };

  const qualityTranslations: Record<string, string> = {
    '360p': 'fast draft low-resolution 360p render for quick concept testing',
    '720p': 'standard definition 720p draft render with basic lighting and textures',
    '1080p': 'Full HD 1080p high resolution crisp realistic rendering',
    '2k': 'ultra-sharp 2K Quad HD realistic digital photo render with fine textures',
    '4k': 'super sharp Ultra HD 4K realistic architectural photograph with stunning lighting',
    '8k': 'exquisite cinematic 8K super-resolution with ultra-fine ray-traced details',
    '16k': 'museum-grade ultra-high-definition 16K print-ready exhibition rendering'
  };

  const qualityVN: Record<string, string> = {
    '360p': '360p (640x360) • Render cực nhanh',
    '720p': '720p (1280x720) • Bản phác nháp',
    '1080p': '1K Full HD (1920x1080) • Tiêu chuẩn',
    '2k': '2K QHD (2560x1440) • Sắc nét cao',
    '4k': '4K UHD (3840x2160) • Siêu rõ nét',
    '8k': '8K Cinematic (7680x4320) • Đỉnh cao',
    '16k': '16K Extreme (15360x8640) • Bản in triển lãm'
  };

  const getColorTempInfo = (temp: number) => {
    if (temp < 2500) return { vn: 'Hổ phách rất ấm', eng: 'ultra-warm amber candlelight of ' + temp + 'K', color: '#ff5500' };
    if (temp < 3500) return { vn: 'Vàng ấm cúng', eng: 'cozy warm white lighting of ' + temp + 'K', color: '#ff9100' };
    if (temp < 4500) return { vn: 'Trắng dịu', eng: 'soft warm white lighting of ' + temp + 'K', color: '#ffc400' };
    if (temp < 5500) return { vn: 'Trắng tự nhiên', eng: 'pure neutral white daylight of ' + temp + 'K', color: '#fffde7' };
    if (temp < 7000) return { vn: 'Trắng mát', eng: 'bright natural white daylight of ' + temp + 'K', color: '#ffffff' };
    if (temp < 8500) return { vn: 'Trắng lạnh', eng: 'crisp cool white daylight of ' + temp + 'K', color: '#b3e5fc' };
    return { vn: 'Xanh lạnh mây trời', eng: 'deep cool ice-blue blue-hour illumination of ' + temp + 'K', color: '#0288d1' };
  };

  const interiorSpaceTranslations: Record<string, string> = {
    'phong-khach': 'luxury cozy living room with a premium designer sofa, sleek coffee table, and plush textured rugs',
    'phong-ngu': 'serene spacious bedroom featuring a king-size bed, soft minimalist linens, and elegant warm bedside pendant lights',
    'phong-bep': 'sleek contemporary open-concept kitchen with custom marble countertops, high-end built-in appliances, and warm wood veneer cabinets',
    'phong-tam': 'spa-like luxury master bathroom with a freestanding stone bathtub, minimal rain shower, and terrazzo finishes',
    'phong-an': 'elegant modern dining room with a solid oak table, designer chairs, and a warm minimalist pendant chandelier',
    'lam-viec': 'inspiring quiet home office featuring a rich walnut desk, an ergonomic chair, and modern floating bookshelves',
    'quan-cafe': 'trendy boutique cafe interior with cozy corner booths, warm brass pendant lamps, and lush aesthetic house plants',
    'showroom': 'high-end minimalist product showroom with museum-grade art track lighting and clean display pedestals'
  };

  const interiorSpaceVN: Record<string, string> = {
    'phong-khach': 'Phòng khách',
    'phong-ngu': 'Phòng ngủ',
    'phong-bep': 'Phòng bếp',
    'phong-tam': 'Phòng tắm',
    'phong-an': 'Phòng ăn',
    'lam-viec': 'Phòng làm việc',
    'quan-cafe': 'Quán Cafe / Nhà hàng',
    'showroom': 'Phòng trưng bày'
  };

  const interiorViewTranslations: Record<string, string> = {
    'city-view': 'a large floor-to-ceiling panoramic glass window overlooking a stunning bright city skyline view',
    'forest-view': 'a wide horizontal panoramic window with a peaceful mist-covered green pine forest view outside',
    'garden-view': 'a grand sliding glass door revealing a beautifully landscaped lush tropical garden view',
    'studio-closed': 'fully-enclosed room with no windows, beautifully illuminated by integrated warm LED cove lighting and ambient spot designer lamps',
    'beach-view': 'a luxury double-glazed glass facade showing a breathtaking azure ocean beach and sand view'
  };

  const interiorViewVN: Record<string, string> = {
    'city-view': 'Cửa sổ phố thị năng động',
    'forest-view': 'Cửa sổ rừng thông mờ sương',
    'garden-view': 'Cửa sổ sân vườn nhiệt đới',
    'studio-closed': 'Không gian khép kín (đèn LED)',
    'beach-view': 'Cửa sổ hướng biển mát lành'
  };

  const planningTypeTranslations: Record<string, string> = {
    'khu-dan-cu': 'modern masterplanned residential neighbourhood with low-rise villas and community gardens',
    'khu-do-thi-sinh-thai': 'eco-friendly sustainable green urban development with solar panels and parks',
    'to-hop-thuong-mai': 'vibrant mixed-use commercial and retail development masterplan with plazas',
    'khu-cong-nghiep': 'eco-industrial park with green factory campuses and efficient logistics layouts',
    'cong-vien-trung-tam': 'grand central public park masterplan with walking paths, sports fields, and fountains'
  };

  const planningTypeVN: Record<string, string> = {
    'khu-dan-cu': 'Khu dân cư hiện đại',
    'khu-do-thi-sinh-thai': 'Khu đô thị sinh thái',
    'to-hop-thuong-mai': 'Tổ hợp thương mại dịch vụ',
    'khu-cong-nghiep': 'Khu công nghiệp xanh',
    'cong-vien-trung-tam': 'Công viên & Trung tâm thể thao'
  };

  const planningEnvironmentTranslations: Record<string, string> = {
    'vung-ven-song': 'nestled along a wide flowing scenic riverfront with a nice waterfront promenade',
    'trung-tam-thanh-pho': 'located in the heart of a dense active urban city center surrounded by sky towers',
    'vung-doi-nui': 'spread across a gentle rolling hill topography with tiered terrain and mist-covered valleys',
    'vung-ven-bien': 'positioned along a sandy tropical coast with crystal-clear turquoise ocean views'
  };

  const planningEnvironmentVN: Record<string, string> = {
    'vung-ven-song': 'Khu vực ven sông nước',
    'trung-tam-thanh-pho': 'Trung tâm thành phố hiện hữu',
    'vung-doi-nui': 'Địa hình đồi núi mộc mạc',
    'vung-ven-bien': 'Bờ biển mát mẻ'
  };

  const planningDetailsList = [
    { id: 'cay-coi', label: 'Cây cối & Thảm thực vật', eng: 'lush dense green trees, landscaped gardens, lawns, and shrubs' },
    { id: 'building', label: 'Tòa nhà phụ / Lân cận', eng: 'surrounding modern medium-rise building silhouettes and architectural backdrops' },
    { id: 'bao-canh', label: 'Bao cảnh & Đường giao thông', eng: 'asphalt roads with clean markings, sidewalks, streetscapes, and realistic context' },
    { id: 'nha-xe', label: 'Nhà xe & Bãi đỗ xe', eng: 'modern open-air parking lots with neat parking spots, small canopies, and parked cars' },
    { id: 'ho-nuoc', label: 'Hồ nước & Kênh cảnh quan', eng: 'reflective central artificial lake, modern water feature elements, and linear canals' },
    { id: 'he-thong-den', label: 'Hệ thống chiếu sáng', eng: 'neat lines of urban street lighting, glowing warm LED light fixtures, and modern lampposts' }
  ];

  const handleModeChange = (newMode: 'exterior' | 'interior' | 'planning') => {
    setMode(newMode);
    setUploadedSketch(null); // Reset custom sketch when mode changes to use appropriate new template
    setEditedImage(null); // Reset any previous edits
    setEditPrompt('');
    setHasDrawn(false);
    if (newMode === 'interior') {
      setBuildingType('phong-khach');
      setEnvironment('garden-view');
    } else if (newMode === 'planning') {
      setBuildingType('khu-dan-cu');
      setEnvironment('vung-ven-song');
    } else {
      setBuildingType('biet-thu');
      setEnvironment('duong-pho-vn');
    }
  };

  // Hardcoded assets for presentation
  const baseExteriorSketchImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000"; // Real modern house architectural mockup
  const baseInteriorSketchImg = "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000"; // Clean minimalist room outline
  const basePlanningSketchImg = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1000"; // Blueprint sketch

  const baseExteriorRenderImg = "/src/assets/images/house_render_1782881083540.jpg";
  const baseInteriorRenderImg = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1000"; // Cozy Japandi living room interior
  const basePlanningRenderImg = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000"; // Epic aerial masterplan planning shot

  const sketchImg = uploadedSketch || (
    mode === 'exterior' 
      ? baseExteriorSketchImg 
      : mode === 'interior' 
        ? baseInteriorSketchImg 
        : basePlanningSketchImg
  );
  
  const baseRenderImg = mode === 'exterior' 
    ? baseExteriorRenderImg 
    : mode === 'interior' 
      ? baseInteriorRenderImg 
      : basePlanningRenderImg;

  const renderImg = editedImage || baseRenderImg;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setEditedImage(null); // Clear edited image when starting a fresh standard render
    setHasDrawn(false);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  // --- Chỉnh sửa ảnh đã tạo (Inpainting Drawing Canvas Handlers) ---
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Relative position matching the internal 800x800 coordinate space
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;
    
    isDrawingRef.current = true;
    setHasDrawn(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (isDrawingMode) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)'; // Beautiful warm translucent amber
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    }
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handleDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handleStopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleInpaintGenerate = () => {
    if (!editPrompt.trim()) return;
    setIsInpaintingGenerating(true);
    setTimeout(() => {
      setIsInpaintingGenerating(false);
      const query = editPrompt.toLowerCase();
      let selectedResult = "";
      
      if (mode === 'exterior') {
        if (query.includes('bể bơi') || query.includes('pool') || query.includes('ao') || query.includes('hồ') || query.includes('bể')) {
          selectedResult = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000"; // modern villa with pool
        } else if (query.includes('xe') || query.includes('car') || query.includes('oto') || query.includes('lamborghini') || query.includes('audi') || query.includes('bmw') || query.includes('xe hơi')) {
          selectedResult = "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1000"; // modern villa with car
        } else if (query.includes('cây') || query.includes('hoa') || query.includes('sân vườn') || query.includes('garden') || query.includes('cỏ') || query.includes('thảm cỏ') || query.includes('cây cối')) {
          selectedResult = "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=80&w=1000"; // rich green landscaped background
        } else {
          selectedResult = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000";
        }
      } else if (mode === 'interior') {
        if (query.includes('đèn') || query.includes('light') || query.includes('led') || query.includes('chiếu sáng')) {
          selectedResult = "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000"; // warm lighting
        } else if (query.includes('sofa') || query.includes('ghế') || query.includes('bàn') || query.includes('couch') || query.includes('giường') || query.includes('bàn ghế')) {
          selectedResult = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000"; // stylish seating
        } else if (query.includes('cây') || query.includes('vườn') || query.includes('monstera') || query.includes('sen') || query.includes('hoa') || query.includes('cây xanh')) {
          selectedResult = "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=1000"; // plant decor
        } else if (query.includes('tranh') || query.includes('art') || query.includes('bức tranh')) {
          selectedResult = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1000"; // wall painting
        } else {
          selectedResult = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1000";
        }
      } else {
        // planning mode
        if (query.includes('sân bay') || query.includes('ga') || query.includes('airport')) {
          selectedResult = "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80&w=1000";
        } else {
          selectedResult = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000";
        }
      }
      setEditedImage(selectedResult);
      setActiveTab('realistic'); // Go back to Realistic view to reveal the stunning edit
    }, 1800);
  };

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedSketch(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleResetSketch = () => {
    setUploadedSketch(null);
  };

  const handleRefUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedReference(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOverRef = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingRef(true);
  };

  const handleDragLeaveRef = () => {
    setIsDraggingRef(false);
  };

  const handleDropRef = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingRef(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleRefUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChangeRef = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleRefUpload(e.target.files[0]);
    }
  };

  const handleResetReference = () => {
    setUploadedReference(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500/10 text-amber-400 p-2 rounded-xl border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-semibold tracking-tight text-lg text-slate-100">
              RENDER T175
            </h1>
            <p className="font-mono text-[10px] text-slate-400 tracking-wider uppercase">
              Sketch-to-Photo AI Engine
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            Trạng thái: <span className="text-emerald-400">Sẵn sàng</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Controls & Customization */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Segment Control: Chế độ Thiết kế */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex w-full relative shadow-xl">
            <button
              onClick={() => handleModeChange('exterior')}
              className={`flex-1 py-3.5 text-xs font-extrabold uppercase tracking-wider text-center rounded-xl transition-all duration-300 flex items-center justify-center space-x-1 ${
                mode === 'exterior'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline lg:inline">Kiến Trúc</span>
              <span className="inline sm:hidden lg:hidden">K.Trúc</span>
            </button>
            <button
              onClick={() => handleModeChange('interior')}
              className={`flex-1 py-3.5 text-xs font-extrabold uppercase tracking-wider text-center rounded-xl transition-all duration-300 flex items-center justify-center space-x-1 ${
                mode === 'interior'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline lg:inline">Nội Thất</span>
              <span className="inline sm:hidden lg:hidden">N.Thất</span>
            </button>
            <button
              onClick={() => handleModeChange('planning')}
              className={`flex-1 py-3.5 text-xs font-extrabold uppercase tracking-wider text-center rounded-xl transition-all duration-300 flex items-center justify-center space-x-1 ${
                mode === 'planning'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline lg:inline">Quy Hoạch</span>
              <span className="inline sm:hidden lg:hidden">Q.Hoạch</span>
            </button>
          </div>

          {/* Section 0: Upload Sketch */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold tracking-wide text-slate-200">1. Phác Thảo {mode === 'exterior' ? 'Kiến Trúc' : mode === 'interior' ? 'Nội Thất' : 'Quy Hoạch'}</h2>
              </div>
              {uploadedSketch && (
                <button 
                  onClick={handleResetSketch}
                  className="text-slate-500 hover:text-rose-400 transition p-1 rounded-lg hover:bg-slate-800"
                  title="Sử dụng lại phác thảo mặc định"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-4 transition flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] ${
                isDragging 
                  ? 'border-amber-500 bg-amber-500/5' 
                  : uploadedSketch 
                    ? 'border-emerald-500/40 bg-emerald-500/[0.02]' 
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {uploadedSketch ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <img 
                    src={uploadedSketch} 
                    alt="Uploaded Sketch Thumbnail" 
                    className="w-20 h-20 object-cover rounded-lg border border-slate-700 shadow-md"
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium text-emerald-400">Đã tải phác thảo lên thành công!</p>
                    <p className="text-[10px] text-slate-500 mt-1">Kéo thanh trượt để so sánh với thiết kế thực tế.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-full bg-slate-900 border border-slate-800 inline-block text-slate-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Nhấp để tải lên hoặc Kéo & Thả</p>
                    <p className="text-[10px] text-slate-500 mt-1">Hỗ trợ ảnh phác thảo JPG, PNG, WEBP</p>
                  </div>
                  <div className="pt-1">
                    <span className="inline-block text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded animate-pulse">
                      Đang dùng phác thảo mẫu
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 1.5: Upload Reference Color & Lighting Image */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold tracking-wide text-slate-200">2. Ảnh Tham Khảo Ánh Sáng & Tone Màu</h2>
              </div>
              {uploadedReference && (
                <button 
                  onClick={handleResetReference}
                  className="text-slate-500 hover:text-rose-400 transition p-1 rounded-lg hover:bg-slate-800"
                  title="Gỡ ảnh tham chiếu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div 
              onDragOver={handleDragOverRef}
              onDragLeave={handleDragLeaveRef}
              onDrop={handleDropRef}
              className={`relative border-2 border-dashed rounded-xl p-4 transition flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] ${
                isDraggingRef 
                  ? 'border-amber-500 bg-amber-500/5' 
                  : uploadedReference 
                    ? 'border-emerald-500/40 bg-emerald-500/[0.02]' 
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChangeRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {uploadedReference ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <img 
                    src={uploadedReference} 
                    alt="Uploaded Reference Thumbnail" 
                    className="w-20 h-20 object-cover rounded-lg border border-slate-700 shadow-md"
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium text-amber-400">Đã áp dụng ảnh tham khảo ánh sáng!</p>
                    <p className="text-[10px] text-slate-500 mt-1">Hệ thống AI sẽ phân tích mood và tone màu từ ảnh này.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-full bg-slate-900 border border-slate-800 inline-block text-slate-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Tải lên Ảnh Ý Tưởng (Moodboard)</p>
                    <p className="text-[10px] text-slate-500 mt-1">Kéo thả ảnh mẫu có ánh sáng / màu bạn thích</p>
                  </div>
                  <div className="pt-1">
                    <span className="inline-block text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      Tùy chọn • Trống
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Section 2: Rendering Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold tracking-wide text-slate-200">3. Thông Số Render</h2>
            </div>

            {/* Thể Loại Công Trình / Không Gian Nội Thất / Quy Hoạch */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span>{mode === 'exterior' ? 'Thể Loại Công Trình' : mode === 'interior' ? 'Không Gian Nội Thất' : 'Mô hình Quy Hoạch'}</span>
              </label>
              <div className="relative">
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-amber-500 focus:outline-none transition appearance-none cursor-pointer"
                >
                  {mode === 'exterior' ? (
                    <>
                      <option value="nha-pho">Nhà phố</option>
                      <option value="biet-thu">Biệt thự</option>
                      <option value="cao-tang">Tòa nhà cao tầng</option>
                      <option value="truong-hoc">Trường học</option>
                      <option value="tttm">Trung tâm thương mại</option>
                      <option value="nha-hang">Nhà hàng</option>
                      <option value="tuyen-pho">Tuyến phố</option>
                      <option value="resort">Khu nghỉ dưỡng</option>
                      <option value="do-thi">Khu đô thị</option>
                    </>
                  ) : mode === 'interior' ? (
                    <>
                      <option value="phong-khach">Phòng khách</option>
                      <option value="phong-ngu">Phòng ngủ</option>
                      <option value="phong-bep">Phòng bếp</option>
                      <option value="phong-tam">Phòng tắm</option>
                      <option value="phong-an">Phòng ăn</option>
                      <option value="lam-viec">Phòng làm việc</option>
                      <option value="quan-cafe">Quán Cafe / Nhà hàng</option>
                      <option value="showroom">Phòng trưng bày</option>
                    </>
                  ) : (
                    <>
                      <option value="khu-dan-cu">Khu dân cư hiện đại</option>
                      <option value="khu-do-thi-sinh-thai">Khu đô thị sinh thái</option>
                      <option value="to-hop-thuong-mai">Tổ hợp thương mại dịch vụ</option>
                      <option value="khu-cong-nghiep">Khu công nghiệp xanh</option>
                      <option value="cong-vien-trung-tam">Công viên & Trung tâm thể thao</option>
                    </>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Design Style Preset */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Phong Cách Thiết Kế</span>
              </label>
              <div className="relative">
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-amber-500 focus:outline-none transition appearance-none cursor-pointer"
                >
                  <option value="hien-dai">Hiện đại</option>
                  <option value="neo-classic">Neo classic</option>
                  <option value="indochine">Indochine</option>
                  <option value="wabi-sabi">Wabi sabi</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="industrial">Industrial</option>
                  <option value="scandinavian">Scandinavian</option>
                  <option value="japandi">Japandi</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Lighting Select */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Ánh Sáng</span>
              </label>
              <div className="relative">
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-amber-500 focus:outline-none transition appearance-none cursor-pointer"
                >
                  <option value="nang-chieu">Nắng chiều 16:30</option>
                  <option value="overcast">Trời âm u (Overcast)</option>
                  <option value="sunset">Trời hoàng hôn</option>
                  <option value="blue-hour">Chạng vạng xanh (Blue Hour)</option>
                  <option value="spring">Mùa xuân tươi mới</option>
                  <option value="midday">Nắng gắt Midday</option>
                  <option value="rainy">Trời mưa Cinematic</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Light Color Temperature */}
            <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                  <Lightbulb 
                    className="w-3.5 h-3.5 transition-all duration-300" 
                    style={{ 
                      color: getColorTempInfo(colorTemp).color, 
                      filter: `drop-shadow(0 0 6px ${getColorTempInfo(colorTemp).color}b3)` 
                    }} 
                  />
                  <span>Nhiệt độ màu</span>
                </label>
                <span 
                  className="font-mono text-xs font-bold transition-colors duration-300 px-2 py-0.5 bg-slate-950 rounded border border-slate-800"
                  style={{ color: getColorTempInfo(colorTemp).color }}
                >
                  {colorTemp.toLocaleString()} K
                </span>
              </div>
              
              <div className="text-[11px] text-slate-400 flex justify-between items-center px-1">
                <span className="text-slate-500">Tone màu:</span>
                <span className="font-medium text-slate-300 transition-colors duration-300">{getColorTempInfo(colorTemp).vn}</span>
              </div>

              {/* Slider Input with dynamic gradient track background */}
              <div className="relative px-1 pt-1">
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="100"
                  value={colorTemp}
                  onChange={(e) => setColorTemp(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all duration-300 accent-amber-500"
                  style={{
                    background: 'linear-gradient(to right, #ff3d00 0%, #ff9100 20%, #ffc400 40%, #fffae0 60%, #e0f7fa 80%, #00b0ff 100%)'
                  }}
                />
                
                {/* Tick marks representing 1000, 3000, 5000, 7000, 10000K */}
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-2 px-0.5">
                  <span>1,000K</span>
                  <span>3,000K</span>
                  <span>5,000K</span>
                  <span>7,000K</span>
                  <span>10,000K</span>
                </div>
              </div>
            </div>

            {/* Bối Cảnh / Góc Nhìn Cửa Sổ */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                <TreePine className="w-3.5 h-3.5 text-amber-400" />
                <span>{mode === 'exterior' ? 'Bối cảnh' : mode === 'interior' ? 'Góc nhìn qua cửa sổ' : 'Vị trí & Bối cảnh'}</span>
              </label>
              <div className="relative">
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-amber-500 focus:outline-none transition appearance-none cursor-pointer"
                >
                  {mode === 'exterior' ? (
                    <>
                      <option value="duong-pho-vn">Đường phố VN (nhà hàng xóm)</option>
                      <option value="lang-que-vn">Vùng làng quê VN</option>
                      <option value="vuon-chau-au">Vườn châu Âu</option>
                      <option value="biet-thu-hn-dat-trong">Biệt thự Hà Nội (đất trống)</option>
                      <option value="duong-pho-hoi-an">Đường phố Hội An</option>
                      <option value="biet-thu-hn-hang-xom">Biệt thự Hà Nội (nhà hàng xóm)</option>
                    </>
                  ) : mode === 'interior' ? (
                    <>
                      <option value="city-view">Cửa sổ phố thị năng động</option>
                      <option value="forest-view">Cửa sổ rừng thông mờ sương</option>
                      <option value="garden-view">Cửa sổ sân vườn nhiệt đới</option>
                      <option value="studio-closed">Không gian khép kín (đèn LED)</option>
                      <option value="beach-view">Cửa sổ hướng biển mát lành</option>
                    </>
                  ) : (
                    <>
                      <option value="vung-ven-song">Khu vực ven sông nước</option>
                      <option value="trung-tam-thanh-pho">Trung tâm thành phố hiện hữu</option>
                      <option value="vung-doi-nui">Địa hình đồi núi mộc mạc</option>
                      <option value="vung-ven-bien">Bờ biển mát mẻ</option>
                    </>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Chi Tiết Quy Hoạch (Planning Details Checkboxes) - only shown when mode is planning */}
            {mode === 'planning' && (
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 animate-fade-in">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5 pb-1.5 border-b border-slate-800/80">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chọn thêm chi tiết Quy hoạch</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-1">
                  {planningDetailsList.map((item) => {
                    const isChecked = planningDetails.includes(item.id);
                    return (
                      <label 
                        key={item.id} 
                        className={`flex items-start space-x-2.5 p-2 rounded-xl border transition cursor-pointer select-none ${
                          isChecked 
                            ? 'border-amber-500/40 bg-amber-500/[0.02] text-slate-200' 
                            : 'border-slate-850 bg-slate-950/20 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setPlanningDetails(planningDetails.filter(id => id !== item.id));
                            } else {
                              setPlanningDetails([...planningDetails, item.id]);
                            }
                          }}
                          className="mt-0.5 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/20 w-3.5 h-3.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tỷ lệ khung hình */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                <Crop className="w-3.5 h-3.5 text-amber-400" />
                <span>Tỷ lệ khung hình (Aspect Ratio)</span>
              </label>
              <div className="relative">
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-amber-500 focus:outline-none transition appearance-none cursor-pointer"
                >
                  <option value="original">
                    {uploadedSketchRatio 
                      ? `Theo ảnh tải lên (${uploadedSketchRatio > 1.2 ? 'Ngang' : uploadedSketchRatio < 0.8 ? 'Đứng' : 'Gần vuông'} ~ ${uploadedSketchRatio.toFixed(2)})` 
                      : 'Tự động theo ảnh tải lên (Mặc định)'}
                  </option>
                  <option value="1:1">Vuông (1:1)</option>
                  <option value="16:9">Màn ảnh rộng (16:9)</option>
                  <option value="4:3">Ngang tiêu chuẩn (4:3)</option>
                  <option value="9:16">Màn hình đứng (9:16)</option>
                  <option value="21:9">Điện ảnh siêu rộng (21:9)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Độ phân giải & Chất lượng ảnh */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Độ phân giải & Chất lượng</span>
              </label>
              <div className="relative">
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-amber-500 focus:outline-none transition appearance-none cursor-pointer"
                >
                  <option value="360p">360p (640x360) • Thử nhanh</option>
                  <option value="720p">720p (1280x720) • Bản phác thảo</option>
                  <option value="1080p">1K Full HD (1920x1080) • Tiêu chuẩn</option>
                  <option value="2k">2K QHD (2560x1440) • Sắc nét cao</option>
                  <option value="4k">4K UHD (3840x2160) • Siêu rõ nét</option>
                  <option value="8k">8K Cinematic (7680x4320) • Đỉnh cao</option>
                  <option value="16k">16K Extreme (15360x8640) • Bản in</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-medium py-3 px-4 rounded-xl shadow-lg shadow-amber-500/10 transition active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang tổng hợp ảnh thực tế...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Tạo Ảnh Render Thực Tế</span>
                </>
              )}
            </button>
          </div>

          {/* Prompt Details card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-slate-300">
              <Info className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">Công Thức Prompt AI</h3>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono leading-relaxed text-slate-400">
              {mode === 'exterior' ? (
                <span>"A luxury, ultra-sharp realistic architectural photograph of the 3D model sketch <span className="text-amber-400">{buildingTypeTranslations[buildingType] || 'villa'}</span> with custom <span className="text-amber-400">{stylePresetTranslations[stylePreset] || 'elegant design elements'}</span>, showcasing crisp reflections. Environment set in a <span className="text-amber-400">{environmentTranslations[environment] || 'realistic scenery'}</span>, illuminated by the <span className="text-amber-400">{lightingTranslations[timeOfDay] || 'beautiful atmospheric lighting'}</span> with <span className="text-amber-400">{getColorTempInfo(colorTemp).eng}</span>{uploadedReference ? ", referencing the elegant lighting, color style, and warm mood palette from the uploaded reference image" : ""}. Rendered in <span className="text-amber-400">{qualityTranslations[quality] || 'high clarity'}</span>."</span>
              ) : mode === 'interior' ? (
                <span>"A luxurious realistic interior design photograph of a <span className="text-amber-400">{interiorSpaceTranslations[buildingType] || 'interior space'}</span> styled in <span className="text-amber-400">{stylePresetTranslations[stylePreset] || 'elegant design elements'}</span>, with <span className="text-amber-400">{interiorViewTranslations[environment] || 'beautiful background view'}</span> outside the window. Beautifully lit with <span className="text-amber-400">{lightingTranslations[timeOfDay] || 'beautiful atmospheric lighting'}</span> with <span className="text-amber-400">{getColorTempInfo(colorTemp).eng}</span>{uploadedReference ? ", referencing the aesthetic style, color tones, and warm luxury mood from the reference image" : ""}. Rendered in <span className="text-amber-400">{qualityTranslations[quality] || 'high clarity'}</span>."</span>
              ) : (
                <span>"A professional realistic architectural aerial masterplan photograph of <span className="text-amber-400">{planningTypeTranslations[buildingType] || 'urban masterplan'}</span> in <span className="text-amber-400">{stylePresetTranslations[stylePreset] || 'modern style'}</span> style. Location <span className="text-amber-400">{planningEnvironmentTranslations[environment] || 'scenic riverside'}</span>. Fully detailed with <span className="text-amber-400">{planningDetails.map(id => planningDetailsList.find(x => x.id === id)?.eng).filter(Boolean).join(', ') || 'exquisite urban elements'}</span>. Beautifully illuminated by the <span className="text-amber-400">{lightingTranslations[timeOfDay] || 'atmospheric lighting'}</span> with <span className="text-amber-400">{getColorTempInfo(colorTemp).eng}</span>{uploadedReference ? ", referencing the planning layout, color palettes, and realistic masterplan mood from the reference image" : ""}. Rendered in <span className="text-amber-400">{qualityTranslations[quality] || 'high clarity'}</span>."</span>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Interactive Visual Canvas */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Tab selectors for view types */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex space-x-1">
              {[
                { id: 'comparison', label: 'So Sánh Trực Quan', icon: Maximize2 },
                { id: 'realistic', label: 'Ảnh Render Thực Tế', icon: Camera },
                { id: 'sketch', label: 'Bản Phác Thảo Gốc', icon: Sliders },
                { id: 'edit', label: 'Chỉnh Sửa Ảnh (Inpaint)', icon: Paintbrush },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="inline sm:hidden">
                      {tab.id === 'comparison' ? 'So sánh' : tab.id === 'realistic' ? 'Render' : tab.id === 'sketch' ? 'Phác thảo' : 'Inpaint'}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <a
              href={renderImg}
              download="architecture_realistic_render.jpg"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800/50 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất ảnh</span>
            </a>
          </div>

          {/* Interactive Interactive Window */}
          <div 
            className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden w-full shadow-2xl flex items-center justify-center transition-all duration-350"
            style={{
              aspectRatio: aspectRatio === 'original' 
                ? (uploadedSketchRatio ? `${uploadedSketchRatio}` : '1 / 1') 
                : aspectRatio.replace(':', ' / ')
            }}
          >
            
            {/* View 1: Interactive slider */}
            {activeTab === 'comparison' && (
              <div className="absolute inset-0 select-none overflow-hidden">
                {/* Sketch Behind */}
                <div className="absolute inset-0">
                  <img 
                    src={sketchImg} 
                    alt="Phác thảo ban đầu" 
                    className="w-full h-full object-cover opacity-90 filter grayscale contrast-125 brightness-75"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700/80 text-[10px] font-mono text-slate-300 shadow-lg uppercase tracking-wider">
                    Bản Phác Thảo Khung Dây
                  </div>
                </div>

                {/* Render Slider Overlay */}
                <div 
                  className="absolute inset-0 overflow-hidden" 
                  style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                >
                  <img 
                    src={renderImg} 
                    alt="Kết quả render thực tế" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider shadow-lg">
                    Ảnh Render Thực Tế
                  </div>
                </div>

                {/* Vertical Slider Controller Guide Line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-500 cursor-ew-resize z-30"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 border-4 border-slate-900 flex items-center justify-center shadow-2xl">
                    <Sliders className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>

                {/* Invisible HTML Input element for drag control */}
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sliderPosition} 
                  onChange={handleSliderChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
                />
              </div>
            )}

            {/* View 2: Only Render */}
            {activeTab === 'realistic' && (
              <div className="absolute inset-0">
                <img 
                  src={renderImg} 
                  alt="Ảnh Render sắc nét" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 animate-fade-in">
                  <div className="font-semibold text-amber-400">Kết Quả Render Thực Tế</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">Chất lượng: {qualityVN[quality] || quality} • Thể loại: {mode === 'exterior' ? (buildingTypeVN[buildingType] || 'Kiến trúc') : mode === 'interior' ? (interiorSpaceVN[buildingType] || 'Nội thất') : (planningTypeVN[buildingType] || 'Quy hoạch')} • Phong cách: {stylePresetVN[stylePreset]} • Ánh sáng: {lightingVN[timeOfDay]} ({colorTemp}K - {getColorTempInfo(colorTemp).vn}) • {mode === 'exterior' ? 'Bối cảnh' : mode === 'interior' ? 'Góc nhìn' : 'Vị thế'}: {mode === 'exterior' ? (environmentVN[environment] || 'Mặc định') : mode === 'interior' ? (interiorViewVN[environment] || 'Mặc định') : (planningEnvironmentVN[environment] || 'Mặc định')}</div>
                </div>
              </div>
            )}

            {/* View 3: Only Sketch */}
            {activeTab === 'sketch' && (
              <div className="absolute inset-0">
                <img 
                  src={sketchImg} 
                  alt="Bản phác thảo mô hình 3D" 
                  className="w-full h-full object-cover filter grayscale contrast-125 brightness-75"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-slate-200">Ý Tưởng Phác Thảo Khung Dây</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">Mô phỏng phác thảo: {mode === 'exterior' ? (buildingTypeVN[buildingType] || 'Kiến trúc') : mode === 'interior' ? (interiorSpaceVN[buildingType] || 'Nội thất') : (planningTypeVN[buildingType] || 'Quy hoạch')}</div>
                </div>
              </div>
            )}

            {/* View 4: Chỉnh sửa ảnh (Inpaint Canvas View) */}
            {activeTab === 'edit' && (
              <div className="absolute inset-0 select-none overflow-hidden bg-slate-950">
                <div className="relative w-full h-full">
                  <img 
                    src={renderImg} 
                    alt="Ảnh chỉnh sửa" 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Interactive Mask Canvas */}
                  <canvas
                    ref={canvasRef}
                    width={getCanvasDimensions().width}
                    height={getCanvasDimensions().height}
                    onMouseDown={handleStartDrawing}
                    onMouseMove={handleDrawing}
                    onMouseUp={handleStopDrawing}
                    onMouseLeave={handleStopDrawing}
                    onTouchStart={handleStartDrawing}
                    onTouchMove={handleDrawing}
                    onTouchEnd={handleStopDrawing}
                    className="absolute inset-0 w-full h-full cursor-crosshair z-20"
                    style={{ touchAction: 'none' }}
                  />
                  
                  {/* Floating Drawing indicator */}
                  <div className="absolute top-4 left-4 z-35 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 shadow-xl flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="font-semibold tracking-wider text-amber-400">BÚT VẼ VÙNG THAY ĐỔI AI (INPAINT)</span>
                  </div>

                  {/* Right side floating controls */}
                  <div className="absolute top-4 right-4 z-35 flex flex-col space-y-2">
                    <button
                      onClick={() => setIsDrawingMode(!isDrawingMode)}
                      title={isDrawingMode ? "Chuyển sang Tẩy xóa nét vẽ" : "Chuyển sang Bút tô màu"}
                      className={`p-2.5 rounded-xl border text-xs font-semibold shadow-xl transition flex items-center justify-center ${
                        isDrawingMode 
                          ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400' 
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {isDrawingMode ? <Paintbrush className="w-4 h-4" /> : <Eraser className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={clearMask}
                      title="Xóa toàn bộ vùng chọn vẽ"
                      disabled={!hasDrawn}
                      className="p-2.5 rounded-xl border bg-slate-900/90 border-slate-700 text-slate-300 hover:text-red-400 hover:border-red-500/40 shadow-xl transition flex items-center justify-center disabled:opacity-40 disabled:hover:text-slate-300 disabled:hover:border-slate-700"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Size slider at the bottom */}
                  <div className="absolute bottom-4 left-4 right-4 z-35 bg-slate-950/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">Cỡ cọ ({brushSize}px):</span>
                      <input 
                        type="range"
                        min="10"
                        max="80"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                    <div className="text-[10px] text-slate-300 flex items-center space-x-1">
                      <span>Đang dùng:</span>
                      <span className={`font-semibold ${isDrawingMode ? 'text-amber-400' : 'text-orange-500'}`}>
                        {isDrawingMode ? 'Bút tô màu' : 'Cục tẩy xóa'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Inpaint generating state overlay */}
                {isInpaintingGenerating && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin"></div>
                      <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div className="text-center space-y-1.5 px-6 max-w-sm">
                      <div className="text-sm font-semibold tracking-wide text-slate-200">Đang tổng hợp thay đổi vùng chọn...</div>
                      <div className="text-[11px] font-mono text-slate-500 leading-relaxed">
                        Đang bảo toàn khung cảnh chính, tái tạo vùng khoanh màu theo: <span className="text-amber-400">"{editPrompt}"</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Simulated generation loading state overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-semibold tracking-wide text-slate-200">Đang Tổng Hợp Ảnh Thực Tế...</div>
                  <div className="text-[11px] font-mono text-slate-500">Đang thêm hiệu ứng ánh sáng tự nhiên, đổ bóng & bề mặt vật liệu kiến trúc</div>
                </div>
              </div>
            )}
          </div>

          {/* Prompt input and editing form for activeTab === 'edit' */}
          {activeTab === 'edit' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Paintbrush className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mô tả nội dung thay đổi tại vùng đã tô</span>
                </label>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dùng cọ vẽ/tô màu ấm lên vùng kiến trúc muốn thay thế (ví dụ: thảm cỏ, khoảng trống trước nhà, góc sofa). Sau đó nhập mong muốn thay đổi ở dưới:
                </p>
              </div>

              <div className="space-y-3">
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder={
                    mode === 'exterior' 
                      ? "Ví dụ: Thêm một hồ bơi sang trọng lát đá tự nhiên xanh biếc, hoặc đỗ chiếc siêu xe thể thao đỏ..."
                      : mode === 'interior'
                        ? "Ví dụ: Thay bằng bộ sofa nỉ góc chữ L màu xám kem thanh lịch, đặt thêm chậu cây Monstera phong thủy..."
                        : "Ví dụ: Thay thế thành hồ nước cảnh quan sinh thái lung linh phản chiếu mây trời..."
                  }
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none transition resize-none leading-relaxed"
                />

                {/* Suggestions chip tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-500 mr-1 uppercase">Gợi ý nhanh:</span>
                  
                  {mode === 'exterior' && (
                    <>
                      <button 
                        onClick={() => setEditPrompt("Thêm một hồ bơi hiện đại lát đá cẩm thạch xanh biếc lấp lánh nước")}
                        className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:border-amber-500 hover:text-amber-400 transition"
                      >
                        + Thêm bể bơi
                      </button>
                      <button 
                        onClick={() => setEditPrompt("Thêm một chiếc siêu xe thể thao màu đỏ đỗ ở lối đi trước nhà")}
                        className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:border-amber-500 hover:text-amber-400 transition"
                      >
                        + Thêm siêu xe
                      </button>
                      <button 
                        onClick={() => setEditPrompt("Thêm hàng cây xanh cảnh quan tươi tốt, thảm cỏ mịn và bụi hoa rực rỡ")}
                        className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:border-amber-500 hover:text-amber-400 transition"
                      >
                        + Thêm cây cảnh & vườn
                      </button>
                    </>
                  )}

                  {mode === 'interior' && (
                    <>
                      <button 
                        onClick={() => setEditPrompt("Đặt một bộ sofa gỗ nỉ cao cấp phong cách Bắc Âu màu kem thanh nhã")}
                        className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:border-amber-500 hover:text-amber-400 transition"
                      >
                        + Thêm sofa nỉ kem
                      </button>
                      <button 
                        onClick={() => setEditPrompt("Treo chùm đèn trần nghệ thuật hiện đại chiếu rọi ánh sáng vàng dịu")}
                        className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:border-amber-500 hover:text-amber-400 transition"
                      >
                        + Thêm đèn thả trần
                      </button>
                      <button 
                        onClick={() => setEditPrompt("Đặt chậu cây Monstera lớn sum suê bên cạnh cửa sổ đón nắng")}
                        className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:border-amber-500 hover:text-amber-400 transition"
                      >
                        + Thêm cây xanh trang trí
                      </button>
                      <button 
                        onClick={() => setEditPrompt("Treo một bức tranh trừu tượng sơn mài khổ lớn nghệ thuật trên tường")}
                        className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:border-amber-500 hover:text-amber-400 transition"
                      >
                        + Treo tranh nghệ thuật
                      </button>
                    </>
                  )}

                  {mode === 'planning' && (
                    <>
                      <button 
                        onClick={() => setEditPrompt("Thêm công viên sinh thái rộng lớn, vườn hoa dạo bộ và mặt hồ nước phản chiếu mây trời")}
                        className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:border-amber-500 hover:text-amber-400 transition"
                      >
                        + Thêm hồ điều hòa & công viên
                      </button>
                      <button 
                        onClick={() => setEditPrompt("Thêm bãi đỗ xe công cộng quy hoạch quy củ có mái lá thông minh và cây xanh rợp bóng")}
                        className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:border-amber-500 hover:text-amber-400 transition"
                      >
                        + Thêm bãi đỗ xe sinh thái
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                {editedImage && (
                  <button
                    onClick={() => {
                      setEditedImage(null);
                      clearMask();
                      setEditPrompt('');
                    }}
                    className="flex-1 py-3 text-xs font-semibold text-slate-400 bg-slate-950 border border-slate-850 rounded-xl hover:text-slate-200 hover:bg-slate-800/40 transition"
                  >
                    Khôi phục ảnh gốc
                  </button>
                )}
                <button
                  onClick={handleInpaintGenerate}
                  disabled={isInpaintingGenerating || !editPrompt.trim() || !hasDrawn}
                  className="flex-[2] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-lg transition active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Áp Dụng Chỉnh Sửa AI (Inpaint)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Quick tips & parameters guide bar */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400 animate-fade-in">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Di chuột hoặc kéo thanh trượt trên ảnh để so sánh trực quan giữa bản phác thảo và ảnh render thực tế. Bạn có thể sang tab Chỉnh Sửa để tô khoanh vùng thay đổi!</span>
              </div>
              <div className="flex items-center space-x-1 font-mono text-[11px] text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800 self-start sm:self-auto">
                <span>Tỷ lệ: 1:1</span>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
