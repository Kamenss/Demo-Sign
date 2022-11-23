import { BaseExampleAutoHidingHeaderComponent } from '../helpers/BaseExampleAutoHidingHeaderComponent';
import { processColor, View } from 'react-native';
import PSPDFKitView from 'react-native-pspdfkit';
import { exampleDocumentPath, pspdfkitColor } from '../configuration/Constants';
import React from 'react';
import { hideToolbar } from '../helpers/NavigationHelper';

export class CustomFontPicker extends BaseExampleAutoHidingHeaderComponent {
  pdfRef = null;

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.pdfRef = React.createRef();

    hideToolbar(navigation);

    navigation.addListener('beforeRemove', e => {
      this.pdfRef?.current?.destroyView();
    });
  }

  componentWillUnmount() {
    const { navigation } = this.props;
    navigation.removeListener('beforeRemove');
  }

  render() {
    return (
      <View style={styles.flex}>
        <PSPDFKitView
          document={exampleDocumentPath}
          ref={this.pdfRef}
          configuration={{
            backgroundColor: processColor('lightgrey'),
            showThumbnailBar: 'scrubberBar',
            useParentNavigationBar: false,
          }}
          availableFontNames={[
            'Arial',
            'Calibri',
            'Times New Roman',
            'Courier New',
            'Helvetica',
            'Comic Sans MS',
          ]}
          selectedFontName={'Courier New'}
          showDownloadableFonts={false}
          style={styles.pdfColor}
        />
      </View>
    );
  }
}
const styles = {
  flex: { flex: 1 },
  pdfColor: { flex: 1, color: pspdfkitColor },
};
