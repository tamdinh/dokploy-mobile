import { Alert, Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { NotificationAllResponseBody, NotificationType } from '@/types/notifications';
import { formatCompactRelativeTime } from '@/lib/utils';
import { useHaptics } from '@/hooks/use-haptics';
import {
  BellIcon,
  ChevronRightIcon,
  MailIcon,
  MessageSquareIcon,
  SendIcon,
  WebhookIcon,
} from 'lucide-react-native';

type Props = {
  notification: NotificationAllResponseBody;
  onDelete?: (notificationId: string) => void;
};

const PROVIDER_LABELS: Record<NotificationType, string> = {
  slack: 'Slack',
  telegram: 'Telegram',
  discord: 'Discord',
  email: 'Email',
  resend: 'Resend',
  gotify: 'Gotify',
  ntfy: 'ntfy',
  mattermost: 'Mattermost',
  pushover: 'Pushover',
  custom: 'Custom',
  lark: 'Lark',
  teams: 'Microsoft Teams',
};

const PROVIDER_ICONS: Record<NotificationType, typeof BellIcon> = {
  slack: MessageSquareIcon,
  telegram: SendIcon,
  discord: MessageSquareIcon,
  email: MailIcon,
  resend: MailIcon,
  gotify: BellIcon,
  ntfy: BellIcon,
  mattermost: MessageSquareIcon,
  pushover: BellIcon,
  custom: WebhookIcon,
  lark: MessageSquareIcon,
  teams: MessageSquareIcon,
};

export function NotificationsCard({ notification, onDelete }: Props) {
  const { impact, notifyWarning } = useHaptics();
  const providerLabel = PROVIDER_LABELS[notification.notificationType];
  const providerIcon = PROVIDER_ICONS[notification.notificationType];
  const createdAtLabel = formatCompactRelativeTime(notification.createdAt);

  const handlePress = () => {
    void impact();
    Alert.alert(notification.name, `Provider: ${providerLabel}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void notifyWarning();
          Alert.alert(
            'Delete Notification',
            `Remove "${notification.name}"? This action cannot be undone.`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => onDelete?.(notification.notificationId),
              },
            ]
          );
        },
      },
    ]);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-card border-border/80 flex-row items-center justify-between rounded-2xl border px-4 py-4 active:opacity-90">
      <View className="flex-1 flex-row items-center gap-3 pr-3">
        <View className="bg-secondary border-border/70 h-11 w-11 items-center justify-center rounded-2xl border">
          <Icon as={providerIcon} className="text-muted-foreground size-5" />
        </View>

        <View className="flex-1 gap-1">
          <Text className="font-semibold" numberOfLines={1}>
            {notification.name}
          </Text>
          <Text variant="muted" numberOfLines={1}>
            {providerLabel}
            {createdAtLabel !== 'Unknown' ? ` • ${createdAtLabel}` : ''}
          </Text>
        </View>
      </View>

      <Icon as={ChevronRightIcon} className="text-muted-foreground/60 size-4" />
    </Pressable>
  );
}
