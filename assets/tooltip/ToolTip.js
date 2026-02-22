// Tooltip.jsx
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './ToolTip.css';

const Tooltip = ({ children, text, position = 'top' }) => {
    const [visible, setVisible] = useState(false);
    const tooltipRef = useRef(null);
    const wrapperRef = useRef(null);
    const [tooltipStyles, setTooltipStyles] = useState({});

    const showTooltip = () => {
        setVisible(true);
    };

    const hideTooltip = () => {
        setVisible(false);
    };

    useEffect(() => {
        if (visible && wrapperRef.current && tooltipRef.current) {
            const wrapperRect = wrapperRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            let top, left;

            switch (position) {
                case 'top':
                    top = wrapperRect.top - tooltipRect.height - 8; // 8px gap
                    left = wrapperRect.left + (wrapperRect.width - tooltipRect.width) / 2;
                    break;
                case 'bottom':
                    top = wrapperRect.bottom + 8;
                    left = wrapperRect.left + (wrapperRect.width - tooltipRect.width) / 2;
                    break;
                case 'left':
                    top = wrapperRect.top + (wrapperRect.height - tooltipRect.height) / 2;
                    left = wrapperRect.left - tooltipRect.width - 8;
                    break;
                case 'right':
                    top = wrapperRect.top + (wrapperRect.height - tooltipRect.height) / 2;
                    left = wrapperRect.right + 8;
                    break;
                default:
                    top = wrapperRect.top - tooltipRect.height - 8;
                    left = wrapperRect.left + (wrapperRect.width - tooltipRect.width) / 2;
            }

            // Adjust if tooltip is out of viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (top < 0) {
                top = wrapperRect.bottom + 8;
            }
            if (left < 0) {
                left = 8;
            } else if (left + tooltipRect.width > viewportWidth) {
                left = viewportWidth - tooltipRect.width - 8;
            }

            setTooltipStyles({
                top: `${top + window.scrollY}px`,
                left: `${left + window.scrollX}px`,
            });
        }
    }, [visible, position]);

    const tooltipNode = visible ? (
        <div className="tooltip-container" style={tooltipStyles} ref={tooltipRef}>
            {text}
        </div>
    ) : null;

    return (
        <div
            className="tooltip-wrapper"
            ref={wrapperRef}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            tabIndex="0" // Make focusable for accessibility
        >
            {children}
            {ReactDOM.createPortal(tooltipNode, document.body)}
        </div>
    );
};

export default Tooltip;
