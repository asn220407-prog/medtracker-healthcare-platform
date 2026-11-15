import React from 'react';
import './SkeletonLoader.css';

export const SkeletonBox = ({ width, height, borderRadius, style = {}, className = '' }) => {
  return (
    <div
      className={`skeleton-shimmer-box ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || '8px',
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export const PatientCardSkeleton = () => {
  return (
    <div className="skeleton-patient-card">
      <div className="skeleton-row-top">
        <SkeletonBox width="46px" height="46px" borderRadius="12px" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonBox width="60%" height="18px" />
          <SkeletonBox width="40%" height="12px" />
        </div>
      </div>
      <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SkeletonBox width="100%" height="10px" />
        <SkeletonBox width="80%" height="10px" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBox width="70px" height="24px" borderRadius="999px" />
        <SkeletonBox width="36px" height="36px" borderRadius="8px" />
      </div>
    </div>
  );
};

export const VitalsRibbonSkeleton = () => {
  return (
    <div className="skeleton-vitals-ribbon">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton-vital-pill">
          <SkeletonBox width="28px" height="28px" borderRadius="50%" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <SkeletonBox width="80px" height="12px" />
            <SkeletonBox width="50px" height="16px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonBox;
