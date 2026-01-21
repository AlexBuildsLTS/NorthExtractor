/**
 * ============================================================================
 * 💠 NORTH INTELLIGENCE OS: GLOBAL HEADER (V2.0 PROD)
 * ============================================================================
 * PATH: components/ui/MainHeader.tsx
 * FIXES:
 * - TS Error: Mapped 'avatar_url' (DB) to 'avatarUrl' (Context State).
 * - Mobile: Full-screen Modal overlay for dropdown to prevent z-index clipping.
 * - Sync: Directly tied to AuthContext for real-time profile updates.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Settings,
  User,
  LogOut,
  ChevronRight,
  Menu,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

export const MainHeader = ({ title }: { title: string }) => {
  const router = useRouter();
  const { user, logout } = useAuth(); // user is typed as OperatorState (camelCase)
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [showMenu, setShowMenu] = useState(false);

  const isDesktop = width >= 1024;
  const rawRole = user?.role || 'Member';
  const isAdmin = rawRole.toLowerCase() === 'admin';

  // Dynamic Avatar rendering
  const renderAvatar = () => {
    if (user?.avatarUrl) {
      return <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />;
    }
    return <User size={20} color={isAdmin ? '#F59E0B' : '#4FD1C7'} />;
  };

  return (
    <View
      style={[styles.root, { paddingTop: isDesktop ? 24 : insets.top + 12 }]}
    >
      <View style={styles.container}>
        {/* LEFT: TITLE & BADGE */}
        <View>
          <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: isAdmin
                  ? 'rgba(245,158,11,0.15)'
                  : 'rgba(79,209,199,0.1)',
              },
            ]}
          >
            <Text
              style={[
                styles.roleText,
                { color: isAdmin ? '#F59E0B' : '#4FD1C7' },
              ]}
            >
              {rawRole.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* RIGHT: PROFILE TRIGGER */}
        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          activeOpacity={0.7}
          style={styles.profileTrigger}
        >
          <View
            style={[
              styles.avatarBox,
              { borderColor: isAdmin ? '#F59E0B' : '#4FD1C7' },
            ]}
          >
            {renderAvatar()}
          </View>
        </TouchableOpacity>
      </View>

      {/* DROPDOWN MODAL (Mobile Safe) */}
      <Modal
        visible={showMenu}
        transparent
        animationType="none"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          {/* Glass Effect Background (iOS only) */}
          {Platform.OS === 'ios' && (
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          )}

          <Animated.View
            entering={FadeInUp.springify()}
            exiting={FadeOut.duration(200)}
            style={[styles.dropdown, { top: isDesktop ? 85 : insets.top + 70 }]}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownLabel}>OPERATOR ID</Text>
              <Text style={styles.dropdownName} numberOfLines={1}>
                {user?.fullName || user?.email || 'Unknown'}
              </Text>
            </View>

            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push('/(tabs)/settings');
                }}
              >
                <View
                  style={[
                    styles.iconBase,
                    { backgroundColor: 'rgba(79, 209, 199, 0.1)' },
                  ]}
                >
                  <Settings size={18} color="#4FD1C7" />
                </View>
                <Text style={styles.menuText}>System Settings</Text>
                <ChevronRight
                  size={14}
                  color="#475569"
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push('/(tabs)/settings/profile');
                }}
              >
                <View
                  style={[
                    styles.iconBase,
                    { backgroundColor: 'rgba(148, 163, 184, 0.1)' },
                  ]}
                >
                  <User size={18} color="#94a3b8" />
                </View>
                <Text style={styles.menuText}>Identity Vault</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={async () => {
                  setShowMenu(false);
                  await logout();
                }}
              >
                <View
                  style={[
                    styles.iconBase,
                    { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                  ]}
                >
                  <LogOut size={18} color="#EF4444" />
                </View>
                <Text style={[styles.menuText, { color: '#EF4444' }]}>
                  Terminate Session
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 100, // Critical for layout stacking
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  profileTrigger: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
  },
  dropdown: {
    position: 'absolute',
    right: 24,
    width: 280,
    borderRadius: 24,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dropdownName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  menuContainer: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  iconBase: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 8,
    marginHorizontal: 12,
  },
});
