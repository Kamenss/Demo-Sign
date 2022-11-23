import { BaseExampleAutoHidingHeaderComponent } from '../helpers/BaseExampleAutoHidingHeaderComponent';
import { Button, Platform, processColor, View } from 'react-native';
import PSPDFKitView from 'react-native-pspdfkit';
import { exampleDocumentPath, pspdfkitColor } from '../configuration/Constants';
import React from 'react';

export class ToolbarCustomization extends BaseExampleAutoHidingHeaderComponent {
  pdfRef = null;

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.pdfRef = React.createRef();

    navigation.addListener('beforeRemove', () => {
      this.pdfRef?.current?.destroyView();
    });
  }

  componentWillUnmount() {
    const { navigation } = this.props;
    navigation.removeListener('beforeRemove');
  }

  render() {
    return (
      <View style={styles.fullScreen}>
        <PSPDFKitView
          ref={this.pdfRef}
          document={exampleDocumentPath}
          configuration={{
            backgroundColor: processColor('lightgrey'),
            useParentNavigationBar: false,
          }}
          //Only IOS
          leftBarButtonItems={['settingsButtonItem']}
          rightBarButtonItems={[
            'searchButtonItem',
            'thumbnailsButtonItem',
            'annotationButtonItem',
            'activityButtonItem',
          ]}
          //Only for Android.
          toolbarMenuItems={[
            'annotationButtonItem',
            'settingsButtonItem',
            'searchButtonItem',
            'thumbnailsButtonItem',
          ]}
          onNavigationButtonClicked={(e) => console.log("hhhh", e)}
          style={styles.pdfColor}
        />
        <View style={styles.wrapperView}>
          <View style={styles.marginLeft}>
            <Button
              onPress={async () => {
                const items = ['searchButtonItem', 'readerViewButtonItem'];

                if (Platform.OS === 'ios') {
                  // Update the right bar buttons for iOS.
                  await this.pdfRef.current.setRightBarButtonItems(
                    items,
                    'document',
                    false,
                  );
                } else if (Platform.OS === 'android') {
                  // Update the toolbar menu items for Android.
                  await this.pdfRef.current.setToolbarMenuItems(items);
                }
              }}
              title="Set Toolbar Items"
              accessibilityLabel="Set Toolbar Items"
            />
          </View>
          <View style={styles.marginLeft}>
            <Button
              onPress={async () => {
                if (Platform.OS === 'android') {
                  alert('Not supported on Android');
                  return;
                }
                // Get the right bar buttons.
                const rightBarButtonItems =
                  await this.pdfRef.current.getRightBarButtonItemsForViewMode(
                    'document',
                  );
                alert(JSON.stringify(rightBarButtonItems));
              }}
              title="Get Bar Button Items"
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = {
  fullScreen: { flex: 1 },
  wrapperView: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    padding: 10,
  },
  marginLeft: { marginLeft: 10 },
  pdfColor: { flex: 1, color: pspdfkitColor },
};
