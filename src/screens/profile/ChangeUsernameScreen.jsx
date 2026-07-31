import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FormField } from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
export default function ChangeUsername() {
  const [newUsername, setNewUsername] = useState('');
  const navigation = useNavigation();
  const handleSave = async () => {
    if (!newUsername || newUsername.length < 3 || newUsername.length > 20) {
      Alert.alert('Error', 'Please enter a username at least 3 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
      Alert.alert("Error", "Username must only contain letters, numbers, or underscores.");
      return;
    }
    navigation.navigate('ConfirmPassword', {
      changeType: 'username',
      changes: { newUsername },
    });
  };
  return <View className={"flex-1 bg-background p-[20px] justify-start"}>
      <Card>
        <Text className={"mb-[12px] text-secondary-foreground leading-[20px]"}>
          Choose a new username. It must be at least 3 characters and unique.
        </Text>
        <FormField label="New username">
          <Input placeholder="New username" value={newUsername} onChangeText={setNewUsername} autoCapitalize="none" autoCorrect={false} textContentType="username" />
        </FormField>
        <Button onPress={handleSave}>Save Username</Button>
      </Card>
    </View>;
}
