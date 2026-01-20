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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icons } from '@/components/ui/Icons';
import {
  Settings,
  User,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

export const MainHeader = ({ title }: { title: string }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [showMenu, setShowMenu] = useState(false);

  const isDesktop = width >= 1024;
  const rawRole = user?.role || 'Member';
  const isAdmin = rawRole.toLowerCase() === 'admin';

  return (
    <View
      style={[styles.root, { paddingTop: isDesktop ? 24 : insets.top + 12 }]}
    >
      <View style={styles.container}>
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

        <TouchableOpacity onPress={() => setShowMenu(true)} activeOpacity={0.7}>
          <View
            style={[
              styles.avatarBox,
              { borderColor: isAdmin ? '#F59E0B' : '#4FD1C7' },
            ]}
          >
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <Icons.User size={20} color={isAdmin ? '#F59E0B' : '#4FD1C7'} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={showMenu} transparent animationType="none">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <Animated.View
            entering={FadeInUp}
            exiting={FadeOut}
            style={[styles.dropdown, { top: isDesktop ? 85 : insets.top + 80 }]}
          >
            <BlurView
              intensity={100}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownName}>
                {user?.full_name || user?.email || 'Operator'}
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
                <Settings size={18} color="#4FD1C7" />
                <Text style={styles.menuText}>System Settings</Text>
                <ChevronRight
                  size={14}
                  color="#1E293B"
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
                <User size={18} color="#8892B0" />
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
                <LogOut size={18} color="#EF4444" />
                <Text style={[styles.menuText, { color: '#EF4444' }]}>
                 Sign Out
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
    backgroundColor: '#0A101F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatar: { width: 44, height: 44, borderRadius: 16 },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 8,
  },
  roleText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  dropdown: {
    position: 'absolute',
    right: 32,
    width: 280,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(10, 16, 31, 0.98)',
  },
  dropdownHeader: {
    padding: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownName: { color: 'white', fontSize: 18, fontWeight: '900' },
  dropdownTier: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 2,
  },
  menuContainer: { padding: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
  },
  menuText: { color: 'white', fontWeight: '800', marginLeft: 16, fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
    marginHorizontal: 20,
  },
});
