import React, { Component } from 'react';
import { Button, processColor, View } from 'react-native';
import PSPDFKitView from 'react-native-pspdfkit';
import { exampleDocumentPath, pspdfkitColor } from '../configuration/Constants';

export class HiddenToolbar extends Component {
  pdfRef = null;

  headerRight(params) {
    return (
      <View style={styles.marginLeft}>
        <Button
          onPress={() => params.handleAnnotationButtonPress()}
          title="Annotations"
        />
      </View>
    );
  }

  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    navigation.setOptions({
      title: 'HiddenToolbar',
      headerRight: () => this.headerRight(params),
    });
  };

  constructor(props) {
    super(props);
    this.pdfRef = React.createRef();

    this.state = {
      annotationCreationActive: false,
      annotationEditingActive: false,
    };
  }

  componentWillUnmount() {
    const { navigation } = this.props;
    navigation.removeListener('beforeRemove');
  }

  componentDidMount() {
    const { navigation } = this.props;
    navigation.addListener('beforeRemove', e => {
      this.pdfRef?.current?.destroyView();
    });

    navigation.setOptions({
      handleAnnotationButtonPress: () => {
        if (
          this.state.annotationCreationActive ||
          this.state.annotationEditingActive
        ) {
          this.pdfRef.current.exitCurrentlyActiveMode();
        } else {
          this.pdfRef.current.enterAnnotationCreationMode();
        }
      },
    });
  }

  render() {
    return (
      <View style={styles.flex}>
        <PSPDFKitView
          ref={this.pdfRef}
          document={exampleDocumentPath}
          configuration={{
            backgroundColor: processColor('lightgrey'),
            // If you want to hide the toolbar it's essential to also hide the document label overlay.
            documentLabelEnabled: false,
            // We want to keep the thumbnail bar always visible, but the automatic mode is also supported with hideDefaultToolbar.
            userInterfaceViewMode: 'alwaysVisible',
            useParentNavigationBar: true,
          }}
          // This will just hide the toolbar, keeping the thumbnail bar visible.
          hideDefaultToolbar={true}
          disableAutomaticSaving={true}
          fragmentTag="PDF1"
          onStateChanged={event => {
            this.setState({
              annotationCreationActive: event.annotationCreationActive,
              annotationEditingActive: event.annotationEditingActive,
            });
          }}
          style={styles.pdfColor}
        />
      </View>
    );
  }
}

const styles = {
  marginLeft: { marginLeft: 10 },
  flex: { flex: 1 },
  pdfColor: { flex: 1, color: pspdfkitColor },
};
