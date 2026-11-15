import React from 'react';

/**
 * Clean, modern vector illustration inspired by minimalist Dribbble healthcare design.
 * Features stylized pill capsule towers, soft clouds, and subtle architectural details.
 * 100% SVG - renders crisply on all screens without heavy assets or AI artifacts.
 */
const PillArchitectureIllustration = () => {
  return (
    <svg
      viewBox="0 0 460 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pill-art-svg"
      aria-label="Medication Routine Art"
    >
      <defs>
        {/* Soft atmospheric gradient */}
        <linearGradient id="artBgGrad" x1="230" y1="0" x2="230" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#28564F" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#11312C" stopOpacity="0.8" />
        </linearGradient>

        {/* Tall Mint Capsule Gradient */}
        <linearGradient id="mintCapTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4EFEA" />
          <stop offset="100%" stopColor="#9FD0C4" />
        </linearGradient>
        <linearGradient id="mintCapBottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#23524B" />
          <stop offset="100%" stopColor="#143A34" />
        </linearGradient>

        {/* Warm Coral Capsule Gradient */}
        <linearGradient id="coralCapTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFDDD4" />
          <stop offset="100%" stopColor="#FFB3A1" />
        </linearGradient>
        <linearGradient id="coralCapBottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7E67" />
          <stop offset="100%" stopColor="#E05B44" />
        </linearGradient>

        {/* Soft Sage Capsule Gradient */}
        <linearGradient id="sageCapTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2F4F0" />
          <stop offset="100%" stopColor="#B2DBD1" />
        </linearGradient>
        <linearGradient id="sageCapBottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B7067" />
          <stop offset="100%" stopColor="#264F48" />
        </linearGradient>

        {/* Cloud Gradient */}
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#D8EDE8" stopOpacity="0.15" />
        </linearGradient>

        {/* Soft shadow filter */}
        <filter id="softShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0A1C19" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Atmospheric Background Oval */}
      <rect width="460" height="300" rx="16" fill="url(#artBgGrad)" />

      {/* Background Soft Floating Clouds */}
      <ellipse cx="140" cy="180" rx="75" ry="45" fill="url(#cloudGrad)" />
      <ellipse cx="320" cy="170" rx="85" ry="50" fill="url(#cloudGrad)" />
      <ellipse cx="230" cy="120" rx="90" ry="55" fill="url(#cloudGrad)" />

      {/* Ground Plane Arc */}
      <path
        d="M -20 300 Q 230 220 480 300 Z"
        fill="#0D2522"
      />

      {/* ========================================================
          CAPSULE 1 (Left - Warm Coral / Peach Capsule Tower)
          ======================================================== */}
      <g filter="url(#softShadow)">
        {/* Top Dome */}
        <path
          d="M 90 120 C 90 85 145 85 145 120 L 145 155 L 90 155 Z"
          fill="url(#coralCapTop)"
        />
        {/* Bottom Body */}
        <path
          d="M 90 155 L 145 155 L 145 235 L 90 235 Z"
          fill="url(#coralCapBottom)"
        />
        {/* Capsule seam highlight */}
        <line x1="90" y1="155" x2="145" y2="155" stroke="#FFA390" strokeWidth="1.5" />
        {/* Small architectural window */}
        <rect x="110" y="170" width="14" height="18" rx="7" fill="#802315" />

        {/* Little White Ladder */}
        <line x1="120" y1="180" x2="100" y2="255" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="126" y1="182" x2="106" y2="257" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="117" y1="195" x2="123" y2="197" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="113" y1="210" x2="119" y2="212" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="109" y1="225" x2="115" y2="227" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="105" y1="240" x2="111" y2="242" stroke="#FFFFFF" strokeWidth="1.5" />
      </g>

      {/* ========================================================
          CAPSULE 2 (Center - Tall Modern Mint Capsule Tower)
          ======================================================== */}
      <g filter="url(#softShadow)">
        {/* Top Dome */}
        <path
          d="M 190 75 C 190 30 270 30 270 75 L 270 140 L 190 140 Z"
          fill="url(#mintCapTop)"
        />
        {/* Bottom Body */}
        <path
          d="M 190 140 L 270 140 L 270 245 L 190 245 Z"
          fill="url(#mintCapBottom)"
        />
        {/* Seam line */}
        <line x1="190" y1="140" x2="270" y2="140" stroke="#71A99C" strokeWidth="2" />
        {/* Little architectural portal window */}
        <rect x="220" y="115" width="20" height="25" rx="4" fill="#13352F" />
        <rect x="224" y="119" width="12" height="17" rx="2" fill="#7FD6C3" opacity="0.6" />
        {/* Lower door */}
        <path d="M 222 245 L 222 225 C 222 220 238 220 238 225 L 238 245 Z" fill="#0A1F1C" />
      </g>

      {/* ========================================================
          CAPSULE 3 (Right - Soft Sage & Coral Capsule Tower)
          ======================================================== */}
      <g filter="url(#softShadow)">
        {/* Top Dome */}
        <path
          d="M 315 130 C 315 100 365 100 365 130 L 365 165 L 315 165 Z"
          fill="url(#coralCapTop)"
        />
        {/* Bottom Body */}
        <path
          d="M 315 165 L 365 165 L 365 240 L 315 240 Z"
          fill="url(#sageCapBottom)"
        />
        {/* Seam line */}
        <line x1="315" y1="165" x2="365" y2="165" stroke="#FFE0D6" strokeWidth="1.5" />
        {/* Little portal */}
        <circle cx="340" cy="148" r="6" fill="#1D423C" />
      </g>

      {/* Foreground Minimalist Ladder & Little Care Truck */}
      <g>
        {/* Minimalist little delivery truck (playful health delivery element) */}
        <rect x="240" y="240" width="34" height="18" rx="4" fill="#FF7E67" />
        <rect x="260" y="244" width="12" height="10" rx="2" fill="#FFE8E2" />
        <circle cx="248" cy="258" r="4.5" fill="#0D211E" />
        <circle cx="266" cy="258" r="4.5" fill="#0D211E" />
        {/* Thin ladder crane */}
        <line x1="244" y1="236" x2="278" y2="198" stroke="#E2F2EE" strokeWidth="2" strokeLinecap="round" />
        <line x1="248" y1="239" x2="282" y2="201" stroke="#E2F2EE" strokeWidth="2" strokeLinecap="round" />
        <line x1="254" y1="228" x2="258" y2="231" stroke="#E2F2EE" strokeWidth="1.5" />
        <line x1="264" y1="216" x2="268" y2="219" stroke="#E2F2EE" strokeWidth="1.5" />
        <line x1="274" y1="204" x2="278" y2="207" stroke="#E2F2EE" strokeWidth="1.5" />
      </g>

      {/* Floating Pill Highlights */}
      <g opacity="0.9">
        {/* Little floating capsule badge at top right */}
        <g transform="translate(370, 45) rotate(25)">
          <rect x="0" y="0" width="30" height="12" rx="6" fill="#FF7E67" />
          <rect x="15" y="0" width="15" height="12" rx="0" fill="#E2F4F0" />
          <rect x="15" y="0" width="15" height="12" rx="6" fill="#E2F4F0" />
        </g>
        {/* Little floating capsule badge at top left */}
        <g transform="translate(60, 60) rotate(-30)">
          <rect x="0" y="0" width="26" height="10" rx="5" fill="#64B0A0" />
          <rect x="13" y="0" width="13" height="10" rx="0" fill="#FFDDD4" />
          <rect x="13" y="0" width="13" height="10" rx="5" fill="#FFDDD4" />
        </g>
      </g>
    </svg>
  );
};

export default PillArchitectureIllustration;
