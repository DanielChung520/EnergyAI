import { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

const GeoInfo = ({ onCoordinatesChange, onAddressChange, defaultLanguage = 'zh-TW' }) => {
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 地址转换为经纬度
    const geocodeAddress = async () => {
        if (!address.trim()) {
            setError('請輸入地址');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&accept-language=${defaultLanguage}`,
                {
                    headers: {
                        'Accept-Language': defaultLanguage
                    }
                }
            );

            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon } = data[0];
                const newCoordinates = { lat, lng: lon };
                setCoordinates(newCoordinates);
                onCoordinatesChange?.(newCoordinates);
            } else {
                setError('找不到該地址的座標');
            }
        } catch (err) {
            setError('地理編碼請求失敗');
            console.error('Geocoding error:', err);
        } finally {
            setLoading(false);
        }
    };

    // 经纬度转换为地址
    const reverseGeocode = async () => {
        if (!coordinates.lat || !coordinates.lng) {
            setError('請輸入有效的經緯度');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&accept-language=${defaultLanguage}`,
                {
                    headers: {
                        'Accept-Language': defaultLanguage
                    }
                }
            );

            const data = await response.json();

            if (data.display_name) {
                setAddress(data.display_name);
                onAddressChange?.(data.display_name);
            } else {
                setError('找不到該座標的地址');
            }
        } catch (err) {
            setError('反向地理編碼請求失敗');
            console.error('Reverse geocoding error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* 地址输入部分 */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    label="地址"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    sx={{ mb: 1 }}
                />
                <Button
                    variant="contained"
                    onClick={geocodeAddress}
                    disabled={loading}
                    sx={{ mr: 1 }}
                >
                    轉換為座標
                </Button>
            </Box>

            {/* 经纬度输入部分 */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    label="緯度"
                    value={coordinates.lat}
                    onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
                    sx={{ mr: 1, mb: 1 }}
                />
                <TextField
                    label="經度"
                    value={coordinates.lng}
                    onChange={(e) => setCoordinates({ ...coordinates, lng: e.target.value })}
                    sx={{ mb: 1 }}
                />
                <Button
                    variant="contained"
                    onClick={reverseGeocode}
                    disabled={loading}
                >
                    轉換為地址
                </Button>
            </Box>

            {/* 加载状态和错误信息 */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}
            {error && (
                <Typography color="error" sx={{ mt: 1 }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};

GeoInfo.propTypes = {
    onCoordinatesChange: PropTypes.func,
    onAddressChange: PropTypes.func,
    defaultLanguage: PropTypes.string
};

export default GeoInfo;
