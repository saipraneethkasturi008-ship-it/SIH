import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { aiService } from '../services/api.js';
import VoiceInputButton from '../components/common/VoiceInputButton.jsx';

import {
  Megaphone,
  Sparkles,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Download,
  Upload,
  Image as ImageIcon,
  MessageCircle,
  FileText,
  Smartphone,
  X
} from 'lucide-react';

const Marketing = () => {
  const { t, currentLanguage, languages } = useLanguage();
  const { business, products } = useBusiness();

  const [product, setProduct] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [tone, setTone] = useState('');
  const [discount, setDiscount] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(
    currentLanguage || 'te'
  );

  const [loading, setLoading] = useState(false);
  const [posterLoading, setPosterLoading] = useState(false);
  const [generatingAiArt, setGeneratingAiArt] = useState(false);
  const [activeTab, setActiveTab] = useState('whatsapp');

  const [content, setContent] = useState({
    whatsappMessage: '',
    socialPost: '',
    posterText: ''
  });

  const [copied, setCopied] = useState(false);

  // Product photo
  const [productImage, setProductImage] = useState(null);
  const [productImageUrl, setProductImageUrl] = useState('');

  // Poster
  const [posterUrl, setPosterUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    setTargetLanguage(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    return () => {
      if (productImageUrl) {
        URL.revokeObjectURL(productImageUrl);
      }
    };
  }, [productImageUrl]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Please select an image smaller than 8 MB.');
      return;
    }

    if (productImageUrl) {
      URL.revokeObjectURL(productImageUrl);
    }

    const imageUrl = URL.createObjectURL(file);

    setProductImage(file);
    setProductImageUrl(imageUrl);
    setPosterUrl('');
  };

  const removeProductImage = () => {
    if (productImageUrl) {
      URL.revokeObjectURL(productImageUrl);
    }

    setProductImage(null);
    setProductImageUrl('');
    setPosterUrl('');
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    if (!product) {
      alert('Please select a product first.');
      return;
    }

    setLoading(true);

    try {
      const res = await aiService.generateMarketingContent({
        product,
        targetCustomer,
        tone,
        discount,
        language: targetLanguage
      });

      if (res && res.data) {
        setContent(res.data);
      }
    } catch (err) {
      console.error('Marketing generation error:', err);
      alert(
        err?.response?.data?.message ||
        'Unable to generate marketing content.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getActiveText = () => {
    if (activeTab === 'whatsapp') {
      return content.whatsappMessage;
    }

    if (activeTab === 'social') {
      return content.socialPost;
    }

    return content.posterText;
  };

  const handleCopy = () => {
    const text = getActiveText();

    if (!text) return;

    navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleShareWhatsApp = () => {
    if (!content.whatsappMessage) return;

    const text = encodeURIComponent(
      content.whatsappMessage
    );

    window.open(
      `https://wa.me/?text=${text}`,
      '_blank'
    );
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = reject;

      image.src = src;
    });
  };

  const wrapText = (
    ctx,
    text,
    maxWidth,
    fontSize,
    fontFamily = 'Arial'
  ) => {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;

    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine
        ? `${currentLine} ${word}`
        : word;

      const width = ctx.measureText(testLine).width;

      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }

        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  const drawRoundedRect = (
    ctx,
    x,
    y,
    width,
    height,
    radius
  ) => {
    ctx.beginPath();

    ctx.moveTo(x + radius, y);

    ctx.lineTo(
      x + width - radius,
      y
    );

    ctx.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + radius
    );

    ctx.lineTo(
      x + width,
      y + height - radius
    );

    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );

    ctx.lineTo(
      x + radius,
      y + height
    );

    ctx.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - radius
    );

    ctx.lineTo(
      x,
      y + radius
    );

    ctx.quadraticCurveTo(
      x,
      y,
      x + radius,
      y
    );

    ctx.closePath();
  };

  const drawImageCover = (
    ctx,
    image,
    x,
    y,
    width,
    height
  ) => {
    const imageRatio =
      image.width / image.height;

    const boxRatio =
      width / height;

    let sourceWidth = image.width;
    let sourceHeight = image.height;
    let sourceX = 0;
    let sourceY = 0;

    if (imageRatio > boxRatio) {
      sourceWidth =
        image.height * boxRatio;

      sourceX =
        (image.width - sourceWidth) / 2;
    } else {
      sourceHeight =
        image.width / boxRatio;

      sourceY =
        (image.height - sourceHeight) / 2;
    }

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height
    );
  };

  const generatePoster = async () => {
    if (!product) {
      alert('Please select a product first.');
      return;
    }

    if (!content.posterText) {
      alert('Please generate the marketing content first.');
      return;
    }

    setPosterLoading(true);

    try {
      let imageSource = productImageUrl;

      if (!imageSource) {
        setGeneratingAiArt(true);
        try {
          const imgRes = await aiService.generateProductImage({
            product,
            discount,
            prompt: `Authentic commercial product illustration for ${product}${discount ? `, featuring offer: ${discount}` : ''}, professional retail marketing, traditional Indian enterprise aesthetic`
          });

          if (imgRes?.imageUrl) {
            imageSource = imgRes.imageUrl;
          }
        } catch (imgErr) {
          console.warn('AI product image generation error, falling back:', imgErr);
        } finally {
          setGeneratingAiArt(false);
        }
      }

      if (!imageSource) {
        throw new Error('Unable to obtain or generate product image.');
      }

      const canvas = canvasRef.current;

      if (!canvas) {
        throw new Error(
          'Poster canvas is unavailable.'
        );
      }

      const width = 1080;
      const height = 1350;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');

      // Background
      const background =
        ctx.createLinearGradient(
          0,
          0,
          width,
          height
        );

      background.addColorStop(
        0,
        '#fff7ed'
      );

      background.addColorStop(
        0.5,
        '#ffedd5'
      );

      background.addColorStop(
        1,
        '#fed7aa'
      );

      ctx.fillStyle = background;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      // Decorative circles
      ctx.globalAlpha = 0.15;

      ctx.fillStyle = '#f97316';

      ctx.beginPath();
      ctx.arc(
        80,
        100,
        170,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.arc(
        1000,
        1250,
        220,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.globalAlpha = 1;

      // Header
      ctx.fillStyle = '#9a3412';

      ctx.textAlign = 'center';

      ctx.font =
        'bold 58px Arial';

      ctx.fillText(
        '✨ FESTIVAL SPECIAL ✨',
        width / 2,
        90
      );

      // Festival / discount box
      drawRoundedRect(
        ctx,
        90,
        125,
        900,
        150,
        35
      );

      ctx.fillStyle = '#ea580c';

      ctx.fill();

      ctx.fillStyle = '#ffffff';

      ctx.font =
        'bold 54px Arial';

      const offerText =
        discount ||
        'Special Festival Offer';

      const offerLines =
        wrapText(
          ctx,
          offerText,
          780,
          54
        );

      offerLines
        .slice(0, 2)
        .forEach((line, index) => {
          ctx.fillText(
            line,
            width / 2,
            190 + index * 62
          );
        });

      // Product image card
      drawRoundedRect(
        ctx,
        90,
        310,
        900,
        560,
        45
      );

      ctx.fillStyle =
        '#ffffff';

      ctx.fill();

      const image =
        await loadImage(
          imageSource
        );

      ctx.save();

      drawRoundedRect(
        ctx,
        120,
        340,
        840,
        500,
        35
      );

      ctx.clip();

      drawImageCover(
        ctx,
        image,
        120,
        340,
        840,
        500
      );

      ctx.restore();

      // Product name
      ctx.fillStyle = '#7c2d12';

      ctx.font =
        'bold 58px Arial';

      const productLines =
        wrapText(
          ctx,
          product,
          850,
          58
        );

      productLines
        .slice(0, 2)
        .forEach((line, index) => {
          ctx.fillText(
            line,
            width / 2,
            930 + index * 65
          );
        });

      // AI poster text
      ctx.fillStyle =
        '#431407';

      ctx.font =
        'bold 34px Arial';

      const posterLines =
        wrapText(
          ctx,
          content.posterText,
          820,
          34
        );

      posterLines
        .slice(0, 4)
        .forEach((line, index) => {
          ctx.fillText(
            line,
            width / 2,
            1070 + index * 48
          );
        });

      // CTA
      drawRoundedRect(
        ctx,
        250,
        1200,
        580,
        90,
        45
      );

      ctx.fillStyle =
        '#c2410c';

      ctx.fill();

      ctx.fillStyle =
        '#ffffff';

      ctx.font =
        'bold 40px Arial';

      ctx.fillText(
        'ORDER NOW • SUPPORT LOCAL',
        width / 2,
        1258
      );

      // Branding
      ctx.fillStyle =
        '#7c2d12';

      ctx.font =
        'bold 25px Arial';

      ctx.fillText(
        'Powered by Udyami Mitra',
        width / 2,
        1325
      );

      const url =
        canvas.toDataURL(
          'image/png',
          1.0
        );

      setPosterUrl(url);

      setActiveTab('poster');
    } catch (error) {
      console.error(
        'Poster generation error:',
        error
      );

      alert(
        'Unable to generate the poster. Please try again.'
      );
    } finally {
      setPosterLoading(false);
      setGeneratingAiArt(false);
    }
  };

  const downloadPoster = () => {
    if (!posterUrl) return;

    const link =
      document.createElement('a');

    link.href = posterUrl;

    link.download =
      `${product || 'udyami-mitra'}-festival-poster.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/10">

        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white mb-2">

          <Sparkles className="w-4 h-4 text-amber-200" />

          <span>
            AI MARKETING GENERATOR
          </span>

        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">

          {t.marketing?.title ||
            'AI Local Marketing Studio'}

        </h1>

        <p className="mt-1 text-sm sm:text-base text-orange-100 max-w-2xl">

          {t.marketing?.subtitle ||
            'Generate WhatsApp messages, festival offers, social posts, and promotional posters in your regional language.'}

        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Generator Controls */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">

          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">

            Campaign & Offer Details

          </h2>

          <form
            onSubmit={handleGenerate}
            className="space-y-4"
          >

            {/* Product */}
            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">

                {t.marketing?.product ||
                  'Product'}

              </label>

              <select
                value={product}
                onChange={(e) =>
                  setProduct(e.target.value)
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              >

                <option value="">
                  Select a product
                </option>

                {products.map((p) => (
                  <option
                    key={p._id || p.id || p.name}
                    value={p.name}
                  >
                    {p.name}
                  </option>
                ))}

                <option value="Festival Pickles Gift Hamper">
                  Festival Pickles Gift Hamper (Combo)
                </option>

              </select>

            </div>

            {/* Product Photo */}
            <div>

              <div className="flex items-center justify-between mb-2">

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    Product Photo
                  </label>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-md">
                    Optional
                  </span>
                </div>

                {productImageUrl && (
                  <button
                    type="button"
                    onClick={removeProductImage}
                    className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                  >

                    <X className="w-3 h-3" />

                    Remove

                  </button>
                )}

              </div>

              {!productImageUrl ? (

                <label className="block cursor-pointer">

                  <div className="border-2 border-dashed border-orange-200 bg-orange-50 hover:bg-orange-100 rounded-2xl p-6 text-center transition-colors">

                    <Upload className="w-8 h-8 mx-auto text-orange-500 mb-2" />

                    <p className="text-sm font-bold text-slate-700">
                      Upload Product Photo (Optional)
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      JPG, PNG or WEBP • Leave empty to let AI illustrate your product
                    </p>

                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                </label>

              ) : (

                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">

                  <img
                    src={productImageUrl}
                    alt="Product preview"
                    className="w-full h-52 object-cover"
                  />

                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-3 py-2 text-xs font-semibold">

                    Product photo ready for poster

                  </div>

                </div>

              )}

            </div>

            {/* Offer */}
            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">

                <span>
                  {t.marketing?.discount ||
                    'Offer / Discount / Festival Details'}
                </span>

                <VoiceInputButton
                  onTranscript={(text) =>
                    setDiscount(text)
                  }
                  className="p-1"
                />

              </label>

              <input
                type="text"
                value={discount}
                onChange={(e) =>
                  setDiscount(e.target.value)
                }
                placeholder="e.g. 10% off for Ugadi / Sankranti!"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              />

            </div>

            {/* Tone + Language */}
            <div className="grid grid-cols-2 gap-3">

              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1">

                  {t.marketing?.tone ||
                    'Tone of Message'}

                </label>

                <select
                  value={tone}
                  onChange={(e) =>
                    setTone(e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
                >

                  <option value="Friendly & Festive">
                    Friendly & Festive
                  </option>

                  <option value="Premium Quality">
                    Pure & Authentic
                  </option>

                  <option value="Urgent Limited Offer">
                    Urgent Limited Offer
                  </option>

                  <option value="Wholesale Retailer Offer">
                    Wholesale / Kirana Pitch
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1">

                  {t.marketing?.language ||
                    'Language'}

                </label>

                <select
                  value={targetLanguage}
                  onChange={(e) =>
                    setTargetLanguage(e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
                >

                  {languages.map((l) => (
                    <option
                      key={l.code}
                      value={l.code}
                    >
                      {l.native}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            {/* Generate Content */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >

              <Sparkles className="w-4 h-4 text-amber-200" />

              <span>
                {loading
                  ? 'Writing in Local Language...'
                  : (
                    t.marketing?.generateBtn ||
                    'Generate Marketing Content'
                  )}
              </span>

            </button>

          </form>

          {/* Poster Generator */}
          <div className="pt-5 border-t border-slate-100">

            <div className="flex items-center gap-2 mb-2">

              <ImageIcon className="w-4 h-4 text-orange-600" />

              <h3 className="text-sm font-bold text-slate-900">

                AI Promotional Poster

              </h3>

            </div>

            <p className="text-xs text-slate-500 mb-3">
              Turn your product photo (or AI-generated art) and festival offer into a ready-to-share poster.
            </p>

            <button
              type="button"
              onClick={generatePoster}
              disabled={
                posterLoading ||
                !product ||
                !content.posterText
              }
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >

              <Sparkles className={`w-4 h-4 ${posterLoading ? 'animate-spin' : ''}`} />

              <span>
                {posterLoading
                  ? (generatingAiArt
                      ? 'Generating AI Product Art...'
                      : 'Designing Poster...')
                  : 'Generate Promotional Poster'}
              </span>

            </button>

            {!productImageUrl && (
              <p className="text-[11px] text-orange-600 font-medium mt-2 text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Photo optional: AI will illustrate your product automatically.</span>
              </p>
            )}

            {!content.posterText && (
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Generate marketing content above first.
              </p>
            )}

          </div>

        </div>

        {/* Output */}
        <div className="lg:col-span-7 space-y-6">

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">

              <button
                onClick={() =>
                  setActiveTab('whatsapp')
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                  activeTab === 'whatsapp'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >

                <MessageCircle className="w-4 h-4" />

                <span>
                  {t.marketing?.whatsappTab ||
                    'WhatsApp Message'}
                </span>

              </button>

              <button
                onClick={() =>
                  setActiveTab('social')
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                  activeTab === 'social'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >

                <Smartphone className="w-4 h-4" />

                <span>
                  {t.marketing?.socialTab ||
                    'Social Post'}
                </span>

              </button>

              <button
                onClick={() =>
                  setActiveTab('poster')
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                  activeTab === 'poster'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >

                <FileText className="w-4 h-4" />

                <span>
                  {t.marketing?.posterTab ||
                    'Poster Banner'}
                </span>

              </button>

            </div>

            {/* Actual Poster */}
            {activeTab === 'poster' &&
              posterUrl ? (

              <div className="space-y-4">

                <div className="flex items-center gap-2">

                  <ImageIcon className="w-5 h-5 text-orange-600" />

                  <div>

                    <h3 className="font-bold text-slate-900">

                      AI Promotional Poster

                    </h3>

                    <p className="text-xs text-slate-500">

                      Ready to share with your customers

                    </p>

                  </div>

                </div>

                <div className="bg-slate-100 rounded-2xl p-3 flex justify-center">

                  <img
                    src={posterUrl}
                    alt="Generated promotional poster"
                    className="w-full max-w-md rounded-xl shadow-lg"
                  />

                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={downloadPoster}
                    className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-sm shadow-md flex items-center justify-center gap-2"
                  >

                    <Download className="w-4 h-4" />

                    Download Poster

                  </button>

                  <button
                    type="button"
                    onClick={generatePoster}
                    disabled={posterLoading}
                    className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-2xl text-sm flex items-center justify-center gap-2"
                  >

                    <RefreshCw
                      className={`w-4 h-4 ${
                        posterLoading
                          ? 'animate-spin'
                          : ''
                      }`}
                    />

                    Regenerate

                  </button>

                </div>

              </div>

            ) : (

              <>
                {/* Text Preview */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 min-h-[200px] flex flex-col justify-between">

                  <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans font-medium">

                    {getActiveText() ||
                      'Generate marketing content to see the result here.'}

                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">

                    <span>
                      Optimized for local Indian consumer trust
                    </span>

                    <span className="font-bold text-orange-600 uppercase">

                      {targetLanguage}

                    </span>

                  </div>

                </div>

                {/* Poster hint */}
                {activeTab === 'poster' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">

                    <ImageIcon className="w-5 h-5 text-orange-600 mt-0.5" />

                    <div>

                      <p className="text-sm font-bold text-orange-900">

                        Create a real promotional poster

                      </p>

                      <p className="text-xs text-orange-700 mt-1">
                        Upload your product photo (or let AI illustrate your product) and click
                        “Generate Promotional Poster”.
                      </p>

                    </div>

                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">

                  {activeTab === 'whatsapp' && (
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                    >

                      <Share2 className="w-4 h-4" />

                      <span>
                        {t.marketing?.shareWhatsapp ||
                          'Share on WhatsApp'}
                      </span>

                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                  >

                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}

                    <span>
                      {copied
                        ? (
                          t.marketing?.copied ||
                          'Copied!'
                        )
                        : (
                          t.marketing?.copyText ||
                          'Copy Text'
                        )}
                    </span>

                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="p-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl shadow-xs transition-colors"
                    title="Regenerate"
                  >

                    <RefreshCw
                      className={`w-4 h-4 ${
                        loading
                          ? 'animate-spin'
                          : ''
                      }`}
                    />

                  </button>

                </div>
              </>
            )}

          </div>

        </div>

      </div>

      {/* Hidden canvas used to create the downloadable poster */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

    </div>
  );
};

export default Marketing;