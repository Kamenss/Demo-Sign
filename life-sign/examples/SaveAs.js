import { BaseExampleAutoHidingHeaderComponent } from '../helpers/BaseExampleAutoHidingHeaderComponent';
import { Text, processColor, View, TouchableOpacity, StyleSheet } from 'react-native';
import PSPDFKitView from 'react-native-pspdfkit';
import {
  pspdfkitColor,
  writableDocumentPath,
} from '../configuration/Constants';
import React from 'react';
import fileSystem from 'react-native-fs';
import { PSPDFKit } from '../helpers/PSPDFKit';

export class SaveAs extends BaseExampleAutoHidingHeaderComponent {
  pdfRef = null;

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.pdfRef = React.createRef();
    this.state = {
      isLoading: false,
    };

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
          ref={this.pdfRef}
          document={writableDocumentPath}
          disableAutomaticSaving={true}
          configuration={{
            backgroundColor: processColor('lightgrey'),
          }}
          pageIndex={3}
          style={styles.colorView(pspdfkitColor)}
        />
        <View style={styles.buttonContainer}>
          <View style={styles.flex}>
            <TouchableOpacity
              disabled={this.state.isLoading}
              onPress={async () => {
                this.setState({ isLoading: true });
                // Ensure that the path to the new document is a writable document path
                // You can use a React Native package like https://github.com/rnmods/react-native-document-picker to allow users of your application to select the path and the file name for the new document
                const fileName = 'newdocument.pdf';
                const newDocumentPath =
                  fileSystem.DocumentDirectoryPath + '/' + fileName;
                try {
                  const isExists = await fileSystem.exists(newDocumentPath);

                  if (isExists) {
                    await fileSystem.unlink(newDocumentPath);
                  }

                  await this.pdfRef.current.saveCurrentDocument();
                  await PSPDFKit.processAnnotations(
                    'embed',
                    'all',
                    writableDocumentPath,
                    newDocumentPath,
                  );

                  const formData = new FormData();

                  formData.append('file', {
                    name: fileName,
                    uri: newDocumentPath,
                    type: 'application/pdf',
                  });

                  const res = await fetch(
                    //'https://dominion.jp.ngrok.io/upload',
                    'https://administrator.lifetek.vn:203/api/save-file',
                    {
                      body: formData,
                      method: 'POST',
                      headers: {
                        'Content-Type': 'multipart/form-data',
                      },
                    },
                  ).then(r => r.json());
                  alert(JSON.stringify(res));
                } catch (error) {
                  alert(error?.message || 'Can not upload file');
                  console.log('=>>>> Error', error);
                } finally {
                  this.setState({ isLoading: false });
                }
              }}
            >
              <Text style={{ color: 'green', fontSize: 18 }}>
                {this.state.isLoading ? 'Uploading....' : 'Save As'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  colorView: color => ({ flex: 1, color }),
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    height: 65,
    padding: 10,
  },
});
