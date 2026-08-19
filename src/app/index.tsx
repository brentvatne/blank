import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "@/theme/colors";

// Street hockey starts at noon on Saturday, Aug 22 (device local time).
const PARTY_START = new Date(2026, 7, 22, 12, 0, 0);
const MAPS_URL = "https://maps.apple.com/?q=Sunset+Beach+Concession";

function getCountdown(now: Date) {
  const ms = PARTY_START.getTime() - now.getTime();
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ alignItems: "center", minWidth: 64 }}>
      <Text
        style={{
          color: colors.cyan,
          fontSize: 34,
          fontWeight: "900",
          fontVariant: ["tabular-nums"],
        }}
      >
        {String(value).padStart(2, "0")}
      </Text>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
        {label}
      </Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 20,
        borderCurve: "continuous",
        padding: 20,
        gap: 12,
      }}
    >
      {children}
    </View>
  );
}

function ScheduleRow({
  icon,
  title,
  time,
}: {
  icon: string;
  title: string;
  time: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <Image
        source={`sf:${icon}`}
        style={{ width: 30, height: 30 }}
        tintColor={colors.pink}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.white, fontSize: 17, fontWeight: "700" }}>
          {title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 15 }}>{time}</Text>
      </View>
    </View>
  );
}

export default function PartyScreen() {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = getCountdown(now);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
    >
      <View style={{ alignItems: "center", gap: 2, paddingVertical: 12 }}>
        <Text
          style={{
            color: colors.cyan,
            fontSize: 44,
            fontWeight: "900",
            letterSpacing: 2,
          }}
        >
          RYAN'S
        </Text>
        <Text
          style={{
            color: colors.pink,
            fontSize: 34,
            fontWeight: "900",
            letterSpacing: 6,
          }}
        >
          40TH
        </Text>
        <Text
          style={{
            color: colors.cyan,
            fontSize: 44,
            fontWeight: "900",
            letterSpacing: 2,
          }}
        >
          BIRTHDAY
        </Text>
        <Text
          style={{
            color: colors.white,
            fontSize: 18,
            fontWeight: "700",
            marginTop: 8,
          }}
        >
          Saturday, Aug 22
        </Text>
      </View>

      <Card>
        {countdown ? (
          <>
            <Text
              style={{
                color: colors.pink,
                fontSize: 13,
                fontWeight: "800",
                letterSpacing: 1.5,
                textAlign: "center",
              }}
            >
              PARTY STARTS IN
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <CountdownUnit value={countdown.days} label="DAYS" />
              <CountdownUnit value={countdown.hours} label="HRS" />
              <CountdownUnit value={countdown.minutes} label="MIN" />
              <CountdownUnit value={countdown.seconds} label="SEC" />
            </View>
          </>
        ) : (
          <Text
            style={{
              color: colors.cyan,
              fontSize: 24,
              fontWeight: "900",
              textAlign: "center",
            }}
          >
            IT'S PARTY TIME! 🎉
          </Text>
        )}
      </Card>

      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Image
            source="sf:mappin.and.ellipse"
            style={{ width: 30, height: 30 }}
            tintColor={colors.pink}
          />
          <View style={{ flex: 1 }}>
            <Text
              selectable
              style={{ color: colors.white, fontSize: 17, fontWeight: "700" }}
            >
              Sunset Beach
            </Text>
            <Text selectable style={{ color: colors.muted, fontSize: 15 }}>
              Meet at the Sunset Beach Concession
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => Linking.openURL(MAPS_URL)}
          style={({ pressed }) => ({
            backgroundColor: colors.cyan,
            borderRadius: 12,
            borderCurve: "continuous",
            paddingVertical: 12,
            alignItems: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              color: colors.backgroundDeep,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Open in Maps
          </Text>
        </Pressable>
      </Card>

      <Card>
        <ScheduleRow
          icon="figure.hockey"
          title="Street Hockey"
          time="12 – 2ish"
        />
        <View
          style={{ height: 1, backgroundColor: colors.cardBorder }}
        />
        <ScheduleRow
          icon="beach.umbrella"
          title="Park / Beach Hang"
          time="2ish til sunset"
        />
      </Card>

      <Text
        style={{
          color: colors.pink,
          fontSize: 16,
          fontWeight: "600",
          textAlign: "center",
          lineHeight: 24,
          paddingHorizontal: 8,
        }}
      >
        We'll fire up a game of street hockey at noon, followed by beach
        games, snacks, drinks, BBQ and just plain hangin' out.
      </Text>

      <Pressable
        onPress={() => router.push("/bring")}
        style={({ pressed }) => ({
          backgroundColor: colors.pink,
          borderRadius: 16,
          borderCurve: "continuous",
          paddingVertical: 16,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Image
          source="sf:checklist"
          style={{ width: 22, height: 22 }}
          tintColor={colors.backgroundDeep}
        />
        <Text
          style={{
            color: colors.backgroundDeep,
            fontSize: 17,
            fontWeight: "800",
          }}
        >
          What to Bring
        </Text>
      </Pressable>
    </ScrollView>
  );
}
